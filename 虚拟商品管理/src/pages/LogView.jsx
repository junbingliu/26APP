//#import doT.min.js
//#import Util.js
//#import log.js

(function () {


    var merchantId = $.params["m"];

    var searchArgs = {};
    searchArgs.merchantId = merchantId;
    searchArgs.logType = "ImportVirtualProductFromExcelLog";
    searchArgs.page = "1";
    searchArgs.limit = "10";

    var searchResult = LogService.getExecuteTimeLogs(searchArgs);
    var total = 0;
    var recordList = [];
    if (searchResult) {
        total = searchResult.totalCount;
        recordList = searchResult.recordList;
    }

    var defaultLogId = "";
    if(recordList && recordList.length>0){
        defaultLogId = recordList[0].id;
    }

    var template = $.getProgram(appMd5, "pages/LogView.jsxp");
    var pageData = {
        merchantId : merchantId,
        recordList : recordList,
        logId : defaultLogId,
        total : total
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

