//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffLogService.jsx

(function () {

    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var logType = $.params["t"];
    var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }

    var isSearch = false;
    var searchParams = {};
    //关键字
    if (keyword && keyword != "") {
        searchParams.keyword = keyword;
        //isSearch = true;
    }

    //分页参数 begin
    var recordType = "首单五折日志";
    var pageLimit = 20;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var logList = [];
    if (isSearch) {

    } else {
        if (logType && logType == "update") {
            totalRecords = DirectFirstOrderHalfOffLogService.getUpdateLogsListSize();
            logList = DirectFirstOrderHalfOffLogService.getUpdateLogs(start, pageLimit);
        } else {
            totalRecords = DirectFirstOrderHalfOffLogService.getLogsListSize();
            logList = DirectFirstOrderHalfOffLogService.getLogs(start, pageLimit);
        }

    }

    //日期格式化
    for (var k = 0; k < logList.length; k++) {
        var jLog = logList[k];
        jLog.formatCreateTime = DateUtil.getLongDate(jLog.createTime);
        if (!jLog.userId) {
            jLog.userId = "";
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

