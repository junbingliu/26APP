//#import doT.min.js
//#import Util.js
//#import product.js
//#import DateUtil.js
//#import UserUtil.js
//#import merchant.js
//#import $favoriteMerchant:services/FavoriteMerchantService.jsx


(function () {

    var merchantId = $.params["m"];
    var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }

    var recordType = "收藏";
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;//总数量
    var start = (currentPage - 1) * pageLimit;

    var recordList = [];

    totalRecords = FavoriteMerchantService.getAllFavoriteListSize("all");
    var listData = FavoriteMerchantService.getAllFavoriteList("all", start, pageLimit);
    for (var i = 0; i < listData.length; i++) {
        var jRecord = listData[i];
        if (!jRecord) {
            continue;
        }

        var formatCreateTime = "";
        if (jRecord.createTime && jRecord.createTime != "") {
            formatCreateTime = DateUtil.getLongDate(jRecord.createTime);
        }
        jRecord.formatCreateTime = formatCreateTime;

        var merchantName = "";
        var jMerchant = MerchantService.getMerchant(jRecord.merchantId);
        if(jMerchant){
            merchantName = jMerchant.name_cn;
        }
        jRecord.merchantName = merchantName;

        recordList.push(jRecord);
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
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/load_favorite.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
