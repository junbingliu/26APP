//#import pigeon.js
//#import jobs.js

var PushManagementService = (function (pigeon) {
    var objPrefix = "pushManagementObj";
    var listPrefix = "pushManagementList";

    var sysTemRecordObjPrefix = "systemRecordObj";
    var sysTemRecordListPrefix = "systemRecordsList";

    var f = {
        projectNames: function () {//app日志类型
            return {
                PUSHMANAGEMENT: "PushManagement",//推送管理-日志
                INVOKINGSERVICE: "InvokingPushService"//迪用推送服务-日志
            }
        },
        operationNames: function () {//操作
            return {
                CREATE: "create",
                MODIFY: "modify",
                DELETE: "delete"
            }
        },
        /**
         * 添加
         * @param jNew
         * @param createUserId
         * @returns {*|NewServiceObj_50000}
         */
        pigeonLock: function (key) {
            pigeon.lock(key);
        },
        pigeonUnLock: function (key) {
            pigeon.unlock(key);
        },
        //todo:app调用日志================================================================
        addLogsForWholeApp: function (referenceId, merchantId, loginUserId, projectNameValue, operationNameValue, remark, new_jNew, old_jNew) {
            $.log("开始调用日志生成addLogsForWholeApp==========》");
            if (!referenceId || referenceId == "" || referenceId == undefined || referenceId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少删除的推送管理内部ID"};
            }
            if (!merchantId || merchantId == "" || merchantId == undefined || merchantId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少merchantId参数"};
            }
            if (!loginUserId || loginUserId == "" || loginUserId == undefined || loginUserId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少创建者参数"};
            }
            var referenceId_data = f.getNew(referenceId);
            if (!referenceId_data || referenceId_data == "" || referenceId_data == undefined || referenceId_data == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "不存在对应的旧数据"};
            }
            // ==新增推送管理操作日志=====
            var currentTime = new Date().getTime();
            var systemRecordId = f.getSystemRecordId();
            var systemRecordKey = f.getKeyByRevertCreateTime(currentTime);
            var systemRecord = {
                id: systemRecordId,//该条推送管理日志ID
                referenceId: referenceId,//该产生日志的数据ID
                operation: operationNameValue,//操作
                project: projectNameValue + "_log",//归属项目
                old_data: old_jNew,//保存旧的推送管理数据
                new_data: new_jNew,//保存新的推送管理数据
                backEndLoginId: loginUserId,//后台登陆者ID
                merchantId: merchantId,//商家平台ID
                operationTime: currentTime,//推送管理日志生成时间---》增删改查的key
                referenceCreateTime: old_jNew.createTime || "",//推送管理服务的创建时间
                remark: remark || ""
            };
            var SystemRecordListId = f.getSystemRecordListName();//所有日志
            var SystemUserRecordListId = f.getSystemUserRecordListName(loginUserId);//操作者日志
            var SystemMerchantRecordListId = f.getSystemMerchantRecordListName(merchantId);//操作台日志
            var PushMangementIDSystemRecordListId = f.getPushMangementIDSystemRecordListName(referenceId);//推送管理服务的日志
            pigeon.saveObject(systemRecordId, systemRecord);
            pigeon.addToList(SystemRecordListId, systemRecordKey, systemRecordId);
            pigeon.addToList(SystemUserRecordListId, systemRecordKey, systemRecordId);
            pigeon.addToList(SystemMerchantRecordListId, systemRecordKey, systemRecordId);
            pigeon.addToList(PushMangementIDSystemRecordListId, systemRecordKey, systemRecordId);
            f.buildSystemRecordIndex(systemRecordId);
            $.log("调用日志生成addLogsForWholeApp=====结束====ID为：》" + systemRecordId);
            return systemRecordId;
        },
        updateLog: function (record) {
            var id = record.id;
            if (!id || id == "" || id == undefined || id == null) {
                $.log("更新log，id不存在，return掉");
                return;
            }
            pigeon.saveObject(id, record);
            f.buildSystemRecordIndex(id);
        },
        //========================todo:==推送服务管理====begin====================================
        addPushOperationRecord: function (new_jNew) {
            var merchantId = new_jNew.merchantId;
            var loginUserId = new_jNew.loginUserId;
            if (!merchantId || merchantId == "" || merchantId == undefined || merchantId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少merchantId参数"};
            }
            if (!loginUserId || loginUserId == "" || loginUserId == undefined || loginUserId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少创建者参数"};
            }
            var id = f.getNewId();
            // var systemRecordId = f.getSystemRecordId();
            var curTime = new Date().getTime();
            new_jNew.id = id;
            new_jNew.createTime = curTime;
            // new_jNew.pushRecords = [];
            // new_jNew.systemRecords = [];
            // var systemRecordId = f.getSystemRecordId();
            // new_jNew.systemRecords.push(systemRecordId);
            // var systemRecord = {
            //     operation: "create",
            //     old_data: false,//保存旧的推送管理数据
            //     new_data: new_jNew,//保存新的推送管理数据
            //     backEndLoginId: loginUserId,//后台登陆者ID
            //     merchantId: merchantId,//商家平台ID
            //     id: systemRecordId,//该条推送管理日志ID
            //     pushManagementId: id,//该条推送管理ID
            //     operationTime: curTime,//推送管理日志生成时间-----------》增删改查的key
            //     pushManagementCreateTime: curTime//推送管理服务的创建时间
            // };
            var key = f.getKeyByRevertCreateTime(curTime);
            var listId = f.getListName();
            // var SystemRecordListId = f.getSystemRecordListName();//所有日志
            // var SystemUserRecordListId = f.getSystemUserRecordListName(loginUserId);//操作者日志
            // var SystemMerchantRecordListId = f.getSystemMerchantRecordListName(merchantId);//操作台日志
            // var PushMangementIDSystemRecordListId = f.getPushMangementIDSystemRecordListName(id);//推送管理服务的日志
            //============保存推送管理操作日志==================
            // pigeon.saveObject(systemRecordId, systemRecord);
            // pigeon.addToList(SystemRecordListId, key, systemRecordId);
            // pigeon.addToList(SystemUserRecordListId, key, systemRecordId);
            // pigeon.addToList(SystemMerchantRecordListId, key, systemRecordId);
            // pigeon.addToList(PushMangementIDSystemRecordListId, key, systemRecordId);
            // f.buildSystemRecordIndex(systemRecordId);
            //========保存推送管理===============
            var projectNameValue = f.projectNames().PUSHMANAGEMENT;
            var operationNameValue = f.operationNames().CREATE;
            var remark = new_jNew.remark || "";
            var old_jNew = false;
            f.addLogsForWholeApp(id, merchantId, loginUserId, projectNameValue, operationNameValue, remark, new_jNew, old_jNew);
            pigeon.saveObject(id, new_jNew);
            pigeon.addToList(listId, key, id);
            f.buildIndex(id);
            return id;
        },
        delPushOperationRecord: function (data) {
            var id = data.id;
            var merchantId = data.merchantId;
            var loginUserId = data.loginUserId;
            if (!id || id == "" || id == undefined || id == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少删除的推送管理内部ID"};
            }
            if (!merchantId || merchantId == "" || merchantId == undefined || merchantId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少merchantId参数"};
            }
            if (!loginUserId || loginUserId == "" || loginUserId == undefined || loginUserId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少创建者参数"};
            }
            var old_jNew = f.getNew(id);
            if (!old_jNew || old_jNew == "" || old_jNew == undefined || old_jNew == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "不存在对应的数据"};
            }
            var createTime = old_jNew.createTime;
            if (!createTime || createTime == "" || createTime == undefined || createTime == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "createTime字段缺失"};
            }
            var key = f.getKeyByRevertCreateTime(createTime);
            //更新推送管理====================================
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);
            pigeon.saveObject(id, null);//硬删除
            // jNew.delete = "T";//软删除
            // pigeon.saveObject(id, jNew);
            f.buildIndex(id);
            var projectNameValue = f.projectNames().PUSHMANAGEMENT;
            var operationNameValue = f.operationNames().MODIFY;
            var remark = data.remark || "";
            var new_jNew = false;
            f.addLogsForWholeApp(id, merchantId, loginUserId, projectNameValue, operationNameValue, remark, new_jNew, old_jNew);
            // ==新增推送管理操作日志=====
            // var modifyTime = new Date().getTime();
            // var systemRecordId = f.getSystemRecordId();
            // var systemRecordKey = f.getKeyByRevertCreateTime(modifyTime);
            // var systemRecord = {
            //     operation: "delete",
            //     old_data: old_jNew,//保存旧的推送管理数据
            //     new_data: false,//保存新的推送管理数据
            //     backEndLoginId: loginUserId,//后台登陆者ID
            //     merchantId: merchantId,//商家平台ID
            //     id: systemRecordId,//该条推送管理日志ID
            //     pushManagementId: id,//该条推送管理ID
            //     operationTime: modifyTime,//推送管理日志生成时间---》增删改查的key
            //     pushManagementCreateTime: old_jNew.createTime//推送管理服务的创建时间
            // };
            // var SystemRecordListId = f.getSystemRecordListName();//所有日志
            // var SystemUserRecordListId = f.getSystemUserRecordListName(loginUserId);//操作者日志
            // var SystemMerchantRecordListId = f.getSystemMerchantRecordListName(merchantId);//操作台日志
            // var PushMangementIDSystemRecordListId = f.getPushMangementIDSystemRecordListName(id);//推送管理服务的日志
            // pigeon.saveObject(systemRecordId, systemRecord);
            // pigeon.addToList(SystemRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(SystemUserRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(SystemMerchantRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(PushMangementIDSystemRecordListId, systemRecordKey, systemRecordId);
            // f.buildSystemRecordIndex(systemRecordId);
            return {RETURN_CODE: "S0A00000", RETURN_DESC: "删除成功"};
        },
        /**
         * 修改
         * @param jNew
         */
        updatePushOperationRecord: function (new_jNew) {
            var id = new_jNew.id;
            var merchantId = new_jNew.merchantId;
            if (!id || id == "" || id == undefined || id == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "不存在对应的数据"};
            }
            if (!merchantId || merchantId == "" || merchantId == undefined || merchantId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少merchantId参数"};
            }
            var loginUserId = new_jNew.loginUserId;
            if (!loginUserId || loginUserId == "" || loginUserId == undefined || loginUserId == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "缺少修改者参数"};
            }
            var old_jNew = f.getNew(id);
            if (!old_jNew || old_jNew == "" || old_jNew == undefined || old_jNew == null) {
                return {RETURN_CODE: "S0A00001", RETURN_DESC: "不存在对应的旧数据"};
            }
            // var modifyTime = new Date().getTime();
            // var systemRecordId = f.getSystemRecordId();
            // new_jNew.lastModifyTime = modifyTime;
            // new_jNew.systemRecords.push(systemRecordId);
            // var systemRecord = {
            //     operation: "modify",
            //     old_data: old_jNew,//保存旧的推送管理数据
            //     new_data: new_jNew,//保存新的推送管理数据
            //     backEndLoginId: loginUserId,//后台登陆者ID
            //     merchantId: merchantId,//商家平台ID
            //     id: systemRecordId,//该条推送管理日志ID
            //     pushManagementId: id,//该条推送管理ID
            //     operationTime: modifyTime,//推送管理日志生成时间---》增删改查的key
            //     pushManagementCreateTime: old_jNew.createTime//推送管理服务的创建时间
            // };
            //更新推送管理====================================
            pigeon.saveObject(id, new_jNew);
            f.buildIndex(id);
            var projectNameValue = f.projectNames().PUSHMANAGEMENT;
            var operationNameValue = f.operationNames().DELETE;
            var remark = new_jNew.remark || "";
            f.addLogsForWholeApp(id, merchantId, loginUserId, projectNameValue, operationNameValue, remark, new_jNew, old_jNew);
            // ==新增推送管理操作日志=====
            // var systemRecordKey = f.getKeyByRevertCreateTime(modifyTime);
            // var SystemRecordListId = f.getSystemRecordListName();//所有日志
            // var SystemUserRecordListId = f.getSystemUserRecordListName(loginUserId);//操作者日志
            // var SystemMerchantRecordListId = f.getSystemMerchantRecordListName(merchantId);//操作台日志
            // var PushMangementIDSystemRecordListId = f.getPushMangementIDSystemRecordListName(id);//推送管理服务的日志
            // pigeon.saveObject(systemRecordId, systemRecord);
            // pigeon.addToList(SystemRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(SystemUserRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(SystemMerchantRecordListId, systemRecordKey, systemRecordId);
            // pigeon.addToList(PushMangementIDSystemRecordListId, systemRecordKey, systemRecordId);
            // f.buildSystemRecordIndex(systemRecordId);
            return {RETURN_CODE: "S0A00000", RETURN_DESC: "保存成功，开始建索引"};
        },
        //==========================推送服务管理====end====================================
        /**
         * 删除
         * @param id
         */
        delAllLogs: function () {
            var logs = f.getAllSystemRecordList(0, 200);
            for (var i = 0; i < logs.length; i++) {
                var log = logs[i];
                if (!logs || log == "" || log == undefined || log == null) {
                    continue;
                }
                var id = log.id;
                var operationTime = log.operationTime;
                if (!id || id == "" || id == undefined || id == null) {
                    continue;
                }
                var systemRecordKey = f.getKeyByRevertCreateTime(operationTime);
                var SystemRecordListId = f.getSystemRecordListName();//所有日志
                var SystemUserRecordListId = f.getSystemUserRecordListName(log.backEndLoginId);//操作者日志
                var SystemMerchantRecordListId = f.getSystemMerchantRecordListName(log.merchantId);//操作台日志
                var PushMangementIDSystemRecordListId = f.getPushMangementIDSystemRecordListName(log.pushManagementId);//推送管理服务的日志
                pigeon.addToList(SystemRecordListId, systemRecordKey, id);
                pigeon.addToList(SystemUserRecordListId, systemRecordKey, id);
                pigeon.addToList(SystemMerchantRecordListId, systemRecordKey, id);
                pigeon.addToList(PushMangementIDSystemRecordListId, systemRecordKey, id);
                pigeon.saveObject(id, null);//硬删除
                f.buildSystemRecordIndex(id);
            }
        },
        /**
         * 获得一个New对象
         * @param id
         * @returns {*|Object}
         */
        getNew: function (id) {
            return pigeon.getObject(id);
        },
        /**
         * 获得多个New对象
         * @param id
         * @returns {*|Object}
         */
        getNews: function (ids) {
            var shows = [];
            for (var i = 0; i < ids.length; i++) {
                shows.push(pigeon.getObject(ids[i]));
            }
            return shows;
        },
        /**
         * 获取指定数量的New对象
         * @param start
         * @param limit
         * @returns {*}
         */
        getAllNewList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        //todo：操作日志===================================
        /**
         * 获取指定数量的New对象
         * @param start
         * @param limit
         * @returns {*}todo：【推送管理】日志总数
         */
        getAllSystemRecordList: function (start, limit) {
            var listId = f.getSystemRecordListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        /**
         * 获取指定数量的New对象
         * @param start
         * @param limit
         * @returns {*}todo：【推送管理】日志--按商家获取队列
         */
        getSystemMerchantRecordList: function (merchantId, start, limit) {
            var listId = f.getSystemMerchantRecordListName(merchantId);
            return pigeon.getListObjects(listId, start, limit);
        },
        /**
         * 获取指定数量的New对象
         * @param start
         * @param limit
         * @returns {*}todo：【推送管理】日志--按操作者获取队列
         */
        getSystemUserRecordList: function (userId, start, limit) {
            var listId = f.getSystemUserRecordListName(userId);
            return pigeon.getListObjects(listId, start, limit);
        },
        /**
         * 获取指定数量的New对象
         * @param start
         * @param limit
         * @returns {*}todo：获取【推送管理】日志--按推送管理条目获取队列
         */
        getPushMangementIDSystemRecordList: function (pushId, start, limit) {
            var listId = f.getPushMangementIDSystemRecordListName(pushId);
            return pigeon.getListObjects(listId, start, limit);
        },
        //todo：============================================================================
        /**
         *
         * @returns {*}
         */
        getAllNewListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
        },
        /**
         * todo：获取【推送管理】日志总数
         * @returns {*}
         */
        getAllSystemRecordsListSize: function () {
            var listId = f.getSystemRecordListName();
            return pigeon.getListSize(listId);
        },
        /**
         * todo：获取【推送管理】日志--按商家获取队列
         * @returns {*}
         */
        getSystemMerchantRecordListSize: function (merchantId) {
            var listId = f.getSystemMerchantRecordListName(merchantId);
            return pigeon.getListSize(listId);
        },
        /**
         * todo：获取【推送管理】日志--按操作者获取队列
         * @returns {*}
         */
        getSystemUserRecordListSize: function (userId) {
            var listId = f.getSystemUserRecordListName(userId);
            return pigeon.getListSize(listId);
        },
        /**
         * todo：获取【推送管理】日志--按推送管理条目获取队列
         * @returns {*}
         */
        getPushMangementIDSystemRecordListSize: function (pushId) {
            var listId = f.getPushMangementIDSystemRecordListName(pushId);
            return pigeon.getListSize(listId);
        },
        //============================================================================
        /**
         * 辅助方法：按时间倒序排序的key
         * @param dateTime
         * @returns {*}
         */
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);//倒序 11111=00000099999
            //return pigeon.getComparableString(dateTime, 11);//升序 11111=00000011111
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("PushManagement");//50000,50001,50002
            return objPrefix + "_" + idNum;//pushManagementObj_50000
        },
        getSystemRecordId: function () {
            var idNum = pigeon.getId("PushManagement_SystemRecord");//50000,50001,50002
            return sysTemRecordObjPrefix + "_" + idNum;//pushManagementObj_50000
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {//推送管理的
            return listPrefix + "_All";
        },
        //todo:推送管理的操作日志--begin
        getSystemRecordListName: function () {//todo：所有日志
            return sysTemRecordListPrefix + "_All";
        },
        getSystemUserRecordListName: function (userId) {//todo：登录者操作日志
            if (!userId || userId == "" || userId == undefined || userId == null) {
                return false;
            }
            return sysTemRecordListPrefix + "_" + userId;
        },
        getSystemMerchantRecordListName: function (merchantId) {//todo：商家平台操作日志
            if (!merchantId || merchantId == "" || merchantId == undefined || merchantId == null) {
                return false;
            }
            return sysTemRecordListPrefix + "_" + merchantId;
        },
        getPushMangementIDSystemRecordListName: function (pushId) {//todo：推送管理条目日志
            if (!pushId || pushId == "" || pushId == undefined || pushId == null) {
                return false;
            }
            return sysTemRecordListPrefix + "_" + pushId;
        },
        //推送管理的操作日志--end
        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/PushManagementBuildIndex.jsx";
            JobsService.runNow("oleMemberClass", jobPageId, {ids: id});
        },
        buildSystemRecordIndex: function (systemRecordId) {
            var jobPageId = "services/SystemRecordsBuildIndex.jsx";
            JobsService.runNow("oleMemberClass", jobPageId, {ids: systemRecordId});
        },
        addOrderidsToOrderLabel: function (orderIds, orderLabelId) {//传入orderIds为数组形式的字符串
            // var orderIdsArr = JSON.parse(orderIds);
            // var listId = orderLabelId + "_StoreOrderids";
            // var key = f.getKeyByRevertCreateTime(curTime);
            // $.log("走进了addOrderidsToOrderLabel=======listId==》   "+listId);
            // orderIdsArr.each(function (i) {
            //     var id = orderIdsArr[i]
            //     if (id && id != "") {
            //         pigeon.addToList(listId, key, id);
            //     }
            // })
        }
    };
    return f;
})($S);