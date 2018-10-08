//#import doT.min.js
//#import Util.js
//#import login.js
//#import merchant.js
//#import session.js
//#import UserUtil.js
//#import pigeon.js
//#import search.js
//#import user.js
//#import DateUtil.js
//#import order.js
//#import $oleMemberClass:services/PushManagementService.jsx
//#import $oleMemberClass:services/SystemRecordsQuery.jsx
(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            return;
        }
        // var keyword = $.params.orderLabelKeyword;
        var pushTarget_value = $.params.pushTarget_value || "";
        var toTriggerState_value = $.params.toTriggerState_value || "";
        var pushServer_value = $.params.pushServer_value || "";
        var pushContentSetUp_value = $.params.pushContentSetUp_value || "";
        var pushStatement_value = $.params.pushStatement_value || "";
        var pushContent_value = $.params.pushContent_value || "";
        var merchantId = $.params.m;
        var pageLimit = 5;
        var displayNum = 6;
        var totalRecords = 0;
        var records = [];
        var recordType = "操作记录";
        var currentPage = $.params["page"];
        var searchParams = {};
        var isSearch = false;
        if (!currentPage) {
            currentPage = 1;
        }
        var start = (currentPage - 1) * pageLimit;
        var limit = 10 + "";
        // if (keyword && keyword != "") {
        //     searchParams.keyword = keyword;
        //     // searchParams.label = keyword;
        //     isSearch = true;
        // }
        if (pushTarget_value != "" && pushTarget_value && pushTarget_value != undefined && pushTarget_value != null) {
            searchParams.pushTarget_value = pushTarget_value;
            isSearch = true;
        }
        if (toTriggerState_value != "" && toTriggerState_value && toTriggerState_value != undefined && toTriggerState_value != null) {
            searchParams.toTriggerState_value = toTriggerState_value;
            isSearch = true;
        }
        if (pushServer_value != "" && pushServer_value && pushServer_value != undefined && pushServer_value != null) {
            searchParams.pushServer_value = pushServer_value;
            isSearch = true;
        }
        if (pushContentSetUp_value != "" && pushContentSetUp_value && pushContentSetUp_value != undefined && pushContentSetUp_value != null) {
            searchParams.pushContentSetUp_value = pushContentSetUp_value;
            isSearch = true;
        }
        if (pushStatement_value != "" && pushStatement_value && pushStatement_value != undefined && pushStatement_value != null) {
            searchParams.pushStatement_value = pushStatement_value;
            isSearch = true;
        }
        if (pushContent_value != "" && pushContent_value && pushContent_value != undefined && pushContent_value != null) {
            searchParams.pushContent_value = pushContent_value;
            isSearch = true;
        }
        searchParams.project = "PushManagement_log";
        isSearch = true;
        if (isSearch) {
            var searchArgs = {
                fetchCount: pageLimit,
                fromPath: start
            };
            searchArgs.sortFields = [{
                field: "createTime",
                type: 'LONG',//STRING
                reverse: true
            }];
            searchArgs.queryArgs = SystemRecordsQuery.getQueryArgs(searchParams);
            //获取数据
            var result = SearchService.search(searchArgs);
            totalRecords = result.searchResult.getTotal();
            var ids = result.searchResult.getLists();
            //end获取数据
            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var record = PushManagementService.getNew(objId);
                if (record) {
                    records.push(record);
                }
            }
        }
        else {
            // if (merchantId == "head_merchant") {//获取总数据
            //     totalRecords = PushManagementService.getAllSystemRecordsListSize();
            //     records = PushManagementService.getAllSystemRecordList(start, pageLimit);
            // } else {//获取商家平台对应的数据
            //     totalRecords = PushManagementService.getSystemMerchantRecordListSize();
            //     records = PushManagementService.getSystemMerchantRecordList(merchantId, start, pageLimit);
            // }
        }
        var new_records = records.map(function (v, i) {
            var operationTime = v.operationTime;
            var operationTimeString = "";
            if (operationTime && operationTime != "" && operationTime != undefined && operationTime != null) {
                operationTimeString = DateUtil.getLongDate(operationTime);
                v.operationTimeString = operationTimeString;
                return v;
            }
            v.operationTimeString = operationTimeString;
            return v;
        })
        // out.print("<br>========totalRecords==========>" + totalRecords);
        // out.print("<br>========records==========>" + JSON.stringify(new_records));
        var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
        var pageParams = {
            recordType: recordType,
            pageLimit: pageLimit,
            displayNum: displayNum,
            totalRecords: totalRecords,
            totalPages: totalPages,
            currentPage: currentPage
        };
        var pageData = {
            state: "ok",
            pushManagement: new_records,
            start: start,
            pageParams: pageParams,
            merchantId: merchantId
        };
        var template = $.getProgram(appMd5, "pages/RecordsManagement/LoadSystemRecords.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e);
    }
})();

