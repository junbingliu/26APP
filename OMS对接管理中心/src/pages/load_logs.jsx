(function () {
//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbControlCenter:services/OmsEsbLogQuery.jsx

    var merchantId = $.params["m"];
    var type = $.params["type"];
    var keyword = $.params["keyword"];
    var serviceId = $.params["serviceId"];
    var serialNumber = $.params["serialNumber"];
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
    //对接服务ID
    if (serviceId && serviceId != "") {
        searchParams.serviceId = serviceId;
        isSearch = true;
    }
    //对接序列号
    if (serialNumber && serialNumber != "") {
        searchParams.serialNumber = serialNumber;
        isSearch = true;
    }
    //日志类型
    if (type && type != "") {
        searchParams.type = type;
    }

    //分页参数 begin
    var recordType = "对接日志";
    var pageLimit = 20;
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
            field:"createTime",
            type:'LONG',
            reverse:true
        }];

        searchArgs.queryArgs = OmsEsbLogQuery.getQueryArgs(searchParams);
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = OmsEsbLogService.getLog(objId);
            if (record) {
                logList.push(record);
            }
        }
    } else {
        totalRecords = OmsEsbLogService.getLogsListSize(type);
        logList = OmsEsbLogService.getLogs(type, start, pageLimit);
    }

    //日期格式化
    for (var k = 0; k < logList.length; k++) {
        var jLog = logList[k];
        jLog.formatCreateTime = DateUtil.getLongDate(jLog.createTime);
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

