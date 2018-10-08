//#import doT.min.js
//#import Util.js
//#import login.js
//#import UserUtil.js
//#import pigeon.js
//#import DateUtil.js
//#import $oleMemberClassSetting:services/StoreService.jsx
(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        var title = $.params.title || "";
        var m = $.params.m;
        var pageLimit = 10;
        var displayNum = 6;
        var totalRecords = 0;
        var records = [];
        var recordType = "门店";
        var currentPage = $.params["page"];
        if (!currentPage) {
            currentPage = 1;
        }
        var start = (currentPage - 1) * pageLimit;
        var limit = 10 + "";

        totalRecords = StoreService.getAllStoreListSize();
        records = StoreService.getAllStoreList(start, pageLimit);

        var index = (currentPage-1) * pageLimit + 1;

        var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
        var pageParams = {
            recordType: recordType,
            pageLimit: pageLimit,
            displayNum: displayNum,
            totalRecords: totalRecords,
            totalPages: totalPages,
            currentPage: currentPage
        };
        var m = $.params.m;
        var pageData = {
            state: "ok",
            index: index,
            orderLabel: records,
            start: start,
            pageParams: pageParams,
            merchantId: m
        };
        var template = $.getProgram(appMd5, "pages/store/load_records.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e);
    }
})();

