//#import excel.js
//#import Util.js
//#import DateUtil.js
//#import login.js
//#import user.js
//#import product.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx

/**
 * 根据中奖规则导出中奖名单，通过筛选后的人进行随机抽取
 */
(function () {
    var merchantId = $.params["m"] || $.getDefaultMerchantId();
    var condition1 = $.params["condition1"] || "";
    var condition2 = $.params["condition2"] || "";
    var condition3 = $.params["condition3"] || "";
    var number = $.params["number"] || 10;
    var successNum = $.params["successNum"] || "";
    var activeId = $.params["activeId"] || "";
    var productObjId = $.params["productId"] || "";
    var exportName = $.params["fileName"] || (new Date()).getTime() + LoginService.getBackEndLoginUserId();
    var index = 0;
    var titles = [
        {"index": index++, "columnWidth": "22", "field": "userName", "title": "用户昵称"},
        {"index": index++, "columnWidth": "22", "field": "productName", "title": "商品名"},
        {"index": index++, "columnWidth": "22", "field": "contactPerson", "title": "联系人"},
        {"index": index++, "columnWidth": "22", "field": "phone", "title": "联系电话"},
        {"index": index++, "columnWidth": "22", "field": "address", "title": "收货信息"},
        {"index": index++, "columnWidth": "22", "field": "createTime", "title": "申请时间"},
        {"index": index++, "columnWidth": "22", "field": "stateName", "title": "审核结果"},
        {"index": index++, "columnWidth": "22", "field": "activeId", "title": "活动ID"},
        {"index": index++, "columnWidth": "22", "field": "userId", "title": "用户ID"},
        {"index": index++, "columnWidth": "22", "field": "productId", "title": "商品ID"},
        {"index": index++, "columnWidth": "22", "field": "remarks", "title": "备注"}
    ];
    try {
        function name1(name) {
            var checkinUserName = "";
            if (name.realName) {
                checkinUserName = name.realName;
            } else if(name.nickName){
                checkinUserName = name.nickName;
            }else{
                checkinUserName = name.loginId;
            }
            return checkinUserName;
        }
        var searchParams = {};
        if(activeId &&activeId != "-1"){
            searchParams.activeId = activeId;
        }
        var productId = productObjId.replace(activeId,"");
        if(productId &&productId != "-1"){
            searchParams.productId = productId;
        }
        searchParams.state = "2";
        var searchArgs = {
            fetchCount: 99999,
            fromPath: 0
        };
        var qValues = trialProductQuery.getQuery(searchParams);
        var queryArgs = {
            mode: 'adv',
            q: qValues
        };
        searchArgs.sortFields = [{
            field: "createTime",
            type: "LONG",
            reverse: true
        }];
        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var result = SearchService.search(searchArgs);
        var ids = result.searchResult.getLists();
        var export_file_type = "successUserExport";
        var arry = [];
        var applictionedObj = {};
        var successObj = {};
        var activeSuccessId = "tryOutManage_success"+activeId+"_group";
        function con0(array,successId) {//过滤这个活动中过奖的用户
            var selfArray = [];
            applictionedObj = tryOutManageServices.getById(successId);
            if(!applictionedObj){
               applictionedObj = {
                   id:successId,
                   activeSuccess:{}
               }
            }
            if(!applictionedObj.activeSuccess){
                applictionedObj.activeSuccess= {};
            }
            for(var h = 0; h < array.length; h++){
                if(!applictionedObj.activeSuccess[array[h].userId]){
                    selfArray.push(array[h]);
                }
            }
            return selfArray;
        }
         //曾经申请过的用户
         function con1(array) {
             var selfArray = [];
             applictionedObj = tryOutManageServices.getById("tryOutManage_user_group");
             if (!applictionedObj.trialUserList) {
                 applictionedObj.trialUserList = {};
             }
             if(applictionedObj){
             for(var h = 0; h < array.length; h++){
                 var user = applictionedObj.trialUserList[array[h].userId];
                 if(user && user >1 ){
                     selfArray.push(array[h]);
                 }
             }
             }
             return selfArray;
         }
         successObj = tryOutManageServices.getById("tryOutManage_success_group");
        if(!successObj){
            successObj = {
                id : "tryOutManage_success_group",
                successObj:{}
            }
        }
        //曾经中过奖的用户
         function con2(array) {
             var successArray = [];
             if(!successObj.successObj){
                 successObj.successObj = {};
             }
             for(var k = 0; k < array.length; k++){
                 if(successObj.successObj[array[k]] && successObj.successObj[array[k]].value == successNum){
                     successArray.push(array[k]);
                 }
             }
             return successArray;
         }
        var successArray = [];
        for(var g = 0; g < ids.size(); g++){
            var objId = ids.get(g);
            var record = TrialProductService.getObject(objId);
            if (record != null) {
                successArray.push(record);
            }
        }
        //被剔除的用户
        if(condition3 == "true"){
            var uid = activeId+"_"+productId+"out";
            var selfArr = [];
            var outUser = tryOutManageServices.getById(uid);
            for(var b = 0; b < successArray.length; b++){
                if(!outUser.userJson[successArray[b]]){
                    selfArr.push(successArray[b]);
                }
            }
            successArray = selfArr;
        }
        //这个条件是默认成立的
        successArray = con0(successArray,activeSuccessId);
        if(condition1 == "true") {
            successArray = con1(successArray);
        }
        if(condition2 == "true"){
            successArray = con2(successArray);
        }
        //筛选成功后再进行数据整理
        for(var p = 0; p < successArray.length; p++){
            successArray[p].period = successArray[p].beginTime +"-" + successArray[p].endTime;
            if(successArray[p].state == "1"){
                successArray[p].stateName = "审核通过";
            }else if(successArray[p].state == "0"){
                successArray[p].stateName = "审核不通过";
            }else{
                successArray[p].stateName = "";
            }
            successArray[p].createTime = DateUtil.getLongDate(successArray[p].createDate);
            if(successArray[p].applicationTime){
                successArray[p].applicationTime = DateUtil.getLongDate(successArray[p].applicationTime);
            }
            var user = UserService.getUser(successArray[p].userId);
            if(user){
                successArray[p].userName = name1(user);
            }
            successArray[p].productName = ProductService.getProduct(successArray[p].productId).htmlname;
            successArray[p].phone = successArray[p].addressInfo.phone;
            successArray[p].contactPerson = successArray[p].addressInfo.userName;
            successArray[p].address = successArray[p].addressInfo.address;
            arry.push(successArray[p]);
        }
        //获取该商品的可卖数
        var sellNum = Number(tryOutManageServices.getById(productObjId).sellNum);
        number = Number(number);
        //如果可卖数小于中奖人数，那就取可卖数
        if(sellNum < number){
            number = sellNum;
        }
        var math = 0;
        var finishArray = [];
        //这个数组是筛选过后的数组的长度
        var hasNum = arry.length;
        //获取一个随机数
        function getNumber(thisNum) {
            math = parseInt(Math.random()*thisNum+1);
            return math-1;
        }

        var arr = [];
        //这个方法的功能是剔除产生重复的随机数
        function contains (arr,obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        }
        //申请用户小于商品数
        if(hasNum < number){
            finishArray = arry;
        }else{
            while (finishArray.length < number){
                var ram = 0;
                ram = getNumber(hasNum);
                //当没有重复的随机数的时候就赋值
                while(contains(arr,ram)){
                    ram = getNumber(hasNum);
                }
                finishArray.push(arry[ram]);
                arr.push(ram);
            }
        }
        var s = Excel.createExcelList(merchantId, exportName, export_file_type, titles, finishArray);
    } catch (e) {
        $.log(e);
    }
    if (s == "ok") {
        out.print(JSON.stringify({param: "ok", msg: "导出成功"}));
    }
})();