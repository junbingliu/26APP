//#import pigeon.js
var LimitActivityService = (function (pigeon) {
    var prefix = "limitActivity_";
    function Activity(data){
        data = data || {};
        this.id = data.id;
        this.name = data.name;
        this.code = data.code;
        this.productId = data.productId;
        this.beginTime = data.beginTime;
        this.endTime = data.endTime;
        this.numberPerUser = data.numberPerUser;        //每个用户能买的数量
        this.numberPerActivity = data.numberPerActivity;      //每个活动能买的数量
        this.isActive = data.isActive;
    }
    var f = {
        getListName : function(productId){
            return prefix+productId;
        },
        getActivities : function(productId,start, number){
            return pigeon.getListObjects(f.getListName(productId),start,number);
        },
        addActivity : function(data){
            var activity = new Activity(data);
            var key = pigeon.getRevertComparableString(activity.endTime/1000,13);
            var id = prefix +  activity.productId + "_" + pigeon.getId("limitActivity");
            activity.id = id;
            pigeon.saveObject(id,activity);
            pigeon.addToList(f.getListName(activity.productId),key,id);
        },
        getActivity : function(id){
            return pigeon.getObject(id);
        },
        updateActivity: function(id,data){
            var old = f.getActivity(id);
            var key = pigeon.getRevertComparableString(old.endTime/1000,13);
            pigeon.deleteFromList(f.getListName(old.productId),key,old.id);
            var key = pigeon.getRevertComparableString(data.endTime/1000,13);
            pigeon.addToList(f.getListName(data.productId),key,id);
            pigeon.saveObject(id,data);
        },
        getNumberActivities: function(productId){
            return pigeon.getListSize(f.getListName(productId));
        },
        addBoughtNumber:function(activityId,productId,orderId,userId,number){
            pigeon.lock(activityId);
            try{
                //不分用户的Id
                var oldNumber = "" + pigeon.getContent(prefix+activityId+"_num");
                if(isNaN(oldNumber)){
                    oldNumber = 0;
                }
                else{
                    oldNumber = Number(oldNumber);
                }
                //如果之前都没扣成功就回滚,要排除这种情况,todo:这个只对限购数量为1有用
                if(oldNumber == 0 && Number(number) < 0){
                    return;
                }
                //分用户的Id
                var userOldNumber = pigeon.getContent(prefix+activityId+"_"+userId +"_num");
                if(isNaN(userOldNumber)){
                    userOldNumber = 0;
                }
                else{
                    userOldNumber = Number(userOldNumber);
                }
                //如果之前都没扣成功就回滚,要排除这种情况,(现在出现订单下单失败,还没有扣掉数量就回滚了,所以这里要加上判断);todo:这个只对限购数量为1有用
                if(userOldNumber == 0 && Number(number) < 0){
                    return;
                }

                var now = new Date().getTime();
                var logNumber = pigeon.getId(prefix+"actlog");
                var logId = prefix + "actlog_" + logNumber;
                var log = {
                    id:"" +logId,
                    oldNumber:"" + oldNumber,
                    logNumber:"" + logNumber,
                    number:"" + number,
                    time:now,
                    productId:"" + productId,
                    activityId:"" + activityId,
                    userId:"" + userId,
                    orderId:"" + orderId
                };
                pigeon.saveObject(logId,log);
                var key = pigeon.getRevertComparableString(now/1000,13);
                pigeon.addToList(prefix + "actlogs_" + activityId,key,logId);
                var newNumber = oldNumber + Number(number);
                pigeon.saveContent(prefix+activityId+"_num",newNumber);

                //修改有用户ID的
                pigeon.addToList(prefix + "actuserlogs_"+activityId + "_"+userId,key,logId);
                var newNumber = userOldNumber + Number(number);
                pigeon.saveContent(prefix+activityId+"_"+userId +"_num",newNumber);

            }finally{
                pigeon.unlock(activityId);
            }
        },
        getActivityLogs : function(activityId,start,number){
            var listName = prefix + "actlogs_" + activityId;
            return pigeon.getListObjects(listName,start,number);
        },

        getActivityLogSize : function(activityId){
            var listName = prefix + "actlogs_" + activityId;
            return pigeon.getListSize(listName);
        },

        getUserBoughtNumber:function(activityId,userId){
            var oldNumber = "" + pigeon.getContent(prefix+activityId+ "_"+userId+"_num");
            if(isNaN(oldNumber)){
                oldNumber = 0;
            }
            else{
                oldNumber = Number(oldNumber);
            }
            return oldNumber;
        },
        getActivityBoughtNumber:function(activityId){
            var oldNumber = pigeon.getContent(prefix+activityId+"_num");
            if(isNaN(oldNumber)){
                oldNumber = 0;
            }
            else{
                oldNumber = Number(oldNumber);
            }
            return oldNumber;
        },
        getCurrentActivity:function(productId){
            var found = false;
            var currentActivity = null;
            var n = 0;
            var now = new Date().getTime();
            while(!found){
                var activities = LimitActivityService.getActivities(productId,n,5);
                if(!activities || activities.length==0){
                    return null;
                }
                n+=5;
                for(var i=0; i<activities.length; i++){
                    var activity = activities[i];
                    if(now > activity.endTime){
                        return null;
                    }
                    if(now > activity.beginTime){
                        currentActivity = activity;
                        found = true;
                        break;
                    }
                }
            }
            return currentActivity;
        },
        checkAndLogActivities : function(userId,jOrder){
            var activities = [];
            var now = new Date().getTime();
            function getActivity(jItem){
                var productId = "" + jItem.optString('productId');
                //获得有效的限购请求
                var found = false;
                var currentActivity = null;
                var n = 0;
                while(!found){
                    var activities = LimitActivityService.getActivities(productId,n,5);
                    if(!activities || activities.length==0){
                        return null;
                    }
                    n+=5;
                    for(var i=0; i<activities.length; i++){
                        var activity = activities[i];
                        if(now > activity.endTime){
                            return null;
                        }
                        if(now > activity.beginTime){
                            currentActivity = activity;
                            found = true;
                            break;
                        }
                    }
                }
                return currentActivity;
            }
            function getProductTotalNumber(productId){
                var jItems = jOrder.opt("items");
                var itemIds = jItems.getNames(jItems);
                var total = 0;
                productId = "" + productId;
                for(var i=0; i<itemIds.length; i++){
                    var itemId = itemIds[i];
                    var jItem = jItems.opt(itemId);
                    var itemProductId = "" + jItem.optString("productId");
                    if(itemProductId == productId){
                        var toNumber = jItem.optLong("amount");
                        total += toNumber;
                    }
                }
                return total;
            }
            function checkItemAndModify(jItem,userId){
                var productId = "" + jItem.optString('productId');
                var toNumber = getProductTotalNumber(productId);
                //获得有效的限购请求
                var currentActivity = getActivity(jItem);
                if(currentActivity){
                    currentActivity.toNumber = toNumber;
                    if(currentActivity.numberPerActivity && currentActivity.numberPerActivity>0){
                        var activityBoughtNumber = Number(LimitActivityService.getActivityBoughtNumber(currentActivity.id));
                        if(activityBoughtNumber+toNumber > currentActivity.numberPerActivity){
                           throw "目前已经卖完了。如果其他人取消订单，还有机会购买，请继续关注。";
                        }
                    }
                    if(currentActivity.numberPerUser && currentActivity.numberPerUser>0){
                        var userBoughtNumber = Number(LimitActivityService.getUserBoughtNumber(currentActivity.id,userId));
                        $.log("\nauserBoughtNumber=" + userBoughtNumber + ",toNumber=" + toNumber);
                        if(userBoughtNumber+toNumber > currentActivity.numberPerUser){
                           throw "一人只能购买"+currentActivity.numberPerUser + "件，已经超出购买限制。";
                        }
                    }
                    activities.push(currentActivity);
                    jItem.put("limitBuyActivityId",currentActivity.id);
                    jItem.put("limitBuyActivityNumber",toNumber);
                }
                return true;
            }
            var orderId = "" + jOrder.opt("id");
            var jItems = jOrder.opt("items");
            var itemIds = jItems.getNames(jItems);
            for(var i=0; i<itemIds.length; i++){
                var itemId = itemIds[i];
                var jItem = jItems.opt(itemId);
                var activity = getActivity(jItem);
                if(activity){
                    activities.push(activity);
                }
            }

            if(activities.length==0){
                return;
            }
            var activityIds = activities.map(function(activity){return activity.id});
            activityIds.sort();
            //开始锁
            try{
                activityIds.forEach(function(id){
                    pigeon.lock(id);
                });

                for(var i=0; i<itemIds.length; i++){
                    var itemId = itemIds[i];
                    var jItem = jItems.opt(itemId);
                    checkItemAndModify(jItem,userId);
                }
                //check完所有，已经成功了，加入log
                for(var i=0; i<itemIds.length; i++){
                    var itemId = itemIds[i];
                    var jItem = jItems.opt(itemId);
                    var productId = "" + jItem.opt("productId");
                    var toNumber = jItem.optLong("amount");
                    var activity = getActivity(jItem);
                    if(activity){
                        f.addBoughtNumber(activity.id,productId,orderId,userId,toNumber);
                    }

                }
            }
            finally{
                activityIds.forEach(function(id){
                    pigeon.unlock(id);
                });
            }
        },

        rollBackActivities: function(userId,jOrder){
            var orderId = "" + jOrder.opt("id");
            var jItems = jOrder.opt("items");
            var itemIds = jItems.getNames(jItems);
            var activities = [];
            for(var i=0; i<itemIds.length; i++){
                var itemId = itemIds[i];
                var jItem = jItems.opt(itemId);
                var productId = "" + jItem.opt("productId");
                var limitBuyActivityId = jItem.opt("limitBuyActivityId");
                if(!limitBuyActivityId){
                    continue;
                }
                var limitBuyActivityNumber = jItem.opt("limitBuyActivityNumber");
                if(!limitBuyActivityNumber){
                    continue;
                }
                activities.push({
                    id:limitBuyActivityId,
                    productId:productId,
                    number : limitBuyActivityNumber,
                    item:jItem
                });
            }
            $.log("....................activities:"+activities);
            if(activities.length==0){
                return;
            }
            var activityIds = activities.map(function(activity){return activity.id;});
            activityIds.sort();
            //开始锁
            try{
                activityIds.forEach(function(activityId){
                    pigeon.lock(activityId);
                });
                activities.forEach(function(activity){
                    f.addBoughtNumber(activity.id,activity.productId,orderId,userId,-activity.number);
                    activity.item.put("limitBuyActivityNumber",0);
                });
            }finally{
                activityIds.forEach(function(activityId){
                    pigeon.unlock(activityId);
                });
            }
        }
    };
    return f;
})($S);