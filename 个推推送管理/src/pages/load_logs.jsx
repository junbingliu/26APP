(function () {
//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import merchant.js
//#import $getui:services/GetuiService.jsx
//#import $getui:services/GetuiLogQuery.jsx

    var merchantId = $.params["m"];
    var type = $.params["type"] || "";
    var isSuccess = $.params["isSuccess"] || "";
    var keyword = $.params["keyword"];
    var beginCreateTime = $.params["beginCreateTime"];
    var endCreateTime = $.params["endCreateTime"];
    var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }

    var isSearch = false;
    var searchParams = {};
    //关键字
    if (keyword && keyword != "") {
        searchParams.keyword = keyword;
        isSearch = true;
    }
    //日志类型
    if (type && type != "" && type != "all") {
        searchParams.type = type;
    }
    //是否成功
    if (isSuccess && isSuccess != "all") {
        searchParams.isSuccess = isSuccess;
        isSearch = true;
    }
    //merchantId
    if (merchantId && merchantId != "head_merchant") {
        searchParams.merchantId = merchantId;
        isSearch = true;
    }
    //beginCreateTime
    if (beginCreateTime) {
        searchParams.beginCreateTime = DateUtil.getLongTime(beginCreateTime) + "";
        isSearch = true;
    }
    //endCreateTime
    if (endCreateTime) {
        searchParams.endCreateTime = DateUtil.getLongTime(endCreateTime) + "";
        isSearch = true;
    }

    //分页参数 begin
    var recordType = "对接日志";
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var logList = [];
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        searchArgs.sortFields = [{
            field: "createTime",
            type: 'LONG',
            reverse: true
        }];

        searchArgs.queryArgs = GetuiLogQuery.getQueryArgs(searchParams);
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = GetuiService.getLog(objId);
            if (record) {
                logList.push(record);
            }
        }
    } else {
        if (type && type != "all") {
            totalRecords = GetuiService.getLogsListSize(type);
            logList = GetuiService.getLogs(type, start, pageLimit);
        } else {
            totalRecords = GetuiService.getAllLogsListSize();
            logList = GetuiService.getAllLogs(start, pageLimit);
        }
    }

    //日期格式化
    for (var k = 0; k < logList.length; k++) {
        var jLog = logList[k];
        jLog.formatCreateTime = DateUtil.getLongDate(jLog.createTime);
        var type = jLog.type;
        if (type == 'auth_sign') {
            jLog.type = "授权";
        } else if (type == 'auth_close') {
            jLog.type = "取消授权";
        } else if (type == 'push_single') {
            jLog.type = "发送单个消息";
        } else if (type == 'push_app') {
            jLog.type = "群发消息";
        } else if (type == 'set_tags') {
            jLog.type = "标签管理";
        } else if (type == 'save_list_body') {
            jLog.type = "上传消息";
        } else if (type == 'push_list') {
            jLog.type = "发送指定消息";
        } else {
            jLog.type = "未知" + type;
        }
        if (jLog.isSuccess) {
            jLog.isSuccess = jLog.isSuccess == 'Y' ? '是' : '否';
        } else {
            jLog.isSuccess = '';
        }
        jLog.merchantName = "平台";
        if (merchantId != "head_merchant") {
            var jMerchant = MerchantService.getMerchant(jLog.merchantId);
            if (jMerchant) {
                jLog.merchantName = jMerchant.name_cn + "(" + jMerchant.objId + ")";
            }
        }
    }

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
        merchantId: merchantId,
        pageParams: pageParams,
        logList: logList
    };

    var template = $.getProgram(appMd5, "pages/load_logs.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

