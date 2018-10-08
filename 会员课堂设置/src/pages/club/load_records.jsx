//#import doT.min.js
//#import Util.js
//#import login.js
//#import UserUtil.js
//#import DateUtil.js
//#import $oleMemberClassSetting:services/ClubService.jsx
(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        var m = $.params.m;
        var currentPage = $.params["page"];


        var pageLimit = 10;
        var displayNum = 6;
        var recordType = "俱乐部";
        if (!currentPage) {
            currentPage = 1;
        }
        var start = (currentPage - 1) * pageLimit;

        var totalRecords = ClubService.getAllClubListSize();
        var records = ClubService.getAllClubList(start, pageLimit);

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
            recordList: records,
            start: start,
            pageParams: pageParams,
            merchantId: m
        };
        var template = $.getProgram(appMd5, "pages/club/load_records.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e);
    }
})();

