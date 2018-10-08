//#import doT.min.js
//#import Util.js
//#import user.js
//#import DateUtil.js
//#import UserUtil.js
//#import product.js


(function () {

    var merchantId = $.params["m"];
    var currentPage = $.params["page"];
    var keyword = $.params["keyword"];
    var cardBatchId = $.params["cardBatchId"];
    if (!currentPage) {
        currentPage = 1;
    }

    var recordType = "商品";
    var pageLimit = 20;
    var displayNum = 6;

    var searchArgs = {};
    searchArgs.page = currentPage;
    searchArgs.page_size = pageLimit;
    searchArgs.merchantId = merchantId;
    searchArgs.columnId = "c_9000";
    if(cardBatchId){
        searchArgs.cardBatchId = cardBatchId;
    }
    searchArgs.fields = "productId,name,columnPath,skuId,outerId,publishState,marketPrice,memberPrice";
    if (keyword && keyword != "") {
        searchArgs.keyword = keyword;
    }

    var result = ProductService.searchProduct(searchArgs);
    var totalRecords = result.total;
    var listData = result.products;

    var recordList = [];
    for (var i = 0; i < listData.length; i++) {
        var jRecord = listData[i];
        if (!jRecord) {
            continue;
        }



        var productId = jRecord.productId;

        var jProduct = ProductService.getProduct(productId);


        jRecord.cardBatchId = jProduct.cardBatchId || "";
        jRecord.realAmount = ProductService.getRealAmount(productId, jRecord.skuId);
        jRecord.sellableCount = ProductService.getSellableCount(productId, jRecord.skuId);
        jRecord.logo = ProductService.getProductLogo(jProduct, "40X40", "/upload/nopic_40.gif");



        recordList.push(jRecord);
    }
    // $.log("recordList======>\n"+JSON.stringify(recordList));
    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    $.log(totalRecords);
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

    var template = $.getProgram(appMd5, "pages/load_product.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
