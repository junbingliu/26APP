(function () {
//#import Util.js
//#import artTemplate3.mini.js
//#import login.js
//#import log.js

    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        out.print("请先登录");
        return;
    }

    var merchantId = $.params["m"];

    var searchArgs = {};
    searchArgs.merchantId = merchantId;
    searchArgs.logType = "integral_product_manager_import";
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
    if (recordList && recordList.length > 0) {
        defaultLogId = recordList[0].id;
    }

    var source = $.getProgram(appMd5, "pages/LogView.jsxp");
    var pageData = {
        merchantId: merchantId,
        recordList: recordList,
        logId: defaultLogId,
        total: total
    };
    var render = template.compile(source);
    out.print(render(pageData));
})();

