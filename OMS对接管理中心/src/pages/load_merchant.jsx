//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import merchant.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
(function () {
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"] || "";
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

    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 15;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var logList = [];
    if (true) {
        //进入搜索
        var searchArgs = {
            keyword: keyword,
            page: currentPage,
            limit: pageLimit,
            page_size: pageLimit
        };
        var result = MerchantService.getMerchants(searchArgs);
        var recordList = result.recordList;
        if (recordList && recordList.length > 0) {
            for (var i = 0; i < recordList.length; i++) {
                var record = recordList[i];
                record.shipNode = OmsControlArgService.getDefaultShipNode(record.merchantId) || "";
                logList.push(record);
            }
        }
        totalRecords = result.totalCount;
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

    var template = $.getProgram(appMd5, "pages/load_merchant.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

