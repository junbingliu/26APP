//#import Util.js
//#import product.js
//#import column.js
//#import doT.min.js
//#import sysArgument.js

(function () {
    var isSearch = false;
    var currentPage = $.params["page"];
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var beginTime = $.params["beginTime"];
    var endTime = $.params["endTime"];
    var productId = $.params["productId"] || "";
    var channel = $.params["channel"] || "";
    var publishState = $.params["publishState"] || "";
    var searchArgs = {};
    if (!currentPage) {
        currentPage = 1;
    }
    //上下架状态
    if (publishState && publishState != "") {
        searchArgs.publishState = publishState;
        isSearch = true;
    }
    //关键字
    if (keyword && keyword != "") {
        searchArgs.keyword = keyword;
        isSearch = true;
    }
    //开始时间
    if (beginTime && beginTime != "") {
        searchArgs.beginCreateTime = beginTime + " 00:00:00";
        isSearch = true;
    }
    //截止时间
    if (endTime && endTime != "") {
        searchArgs.endCreateTime = endTime + " 23:59:59";
        isSearch = true;
    }
    //商品Id
    if (productId && productId != "") {
        searchArgs.id = productId;
        isSearch = true;
    }
    //渠道  app:APP  h5:微商城
    if (channel && channel != "") {
        searchArgs.channel = channel;
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 15;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;
    var result;
    var resultList = [];

    var ole_merchantId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");
    searchArgs.page = Number(currentPage);//页码,从1开始
    searchArgs.page_size = pageLimit;//每页多少条
    searchArgs.merchantId = ole_merchantId;//商家Id
    searchArgs.fields = "productId,name,sellableCount,merchantName,merchantId,channel,columnId,publishState,outerId,barcode";
    searchArgs.sortFields = [{
        field: "head_merchant_c_10000_PosOrder",
        type: "LONG",
        reverse: false
    }, {field: 'createTime', type: 'STRING', reverse: false}];
    result = ProductService.searchProduct(searchArgs);
    var products = result.products;
    transform(products, resultList);
    totalRecords = result.total;
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
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId
    };

    var template = $.getProgram(appMd5, "pages/load_products.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

function transform(products, resultList) {
    for (var i = 0; i < products.length; i++) {
        var column = ColumnService.getColumn(products[i].columnId);
        var product = {};
        product.productId = products[i].productId;
        product.productName = products[i].name;
        product.categoryName = column.name;
        product.channel = products[i].channel;
        product.publishState = products[i].publishState;
        product.sellableCount = products[i].sellableCount;
        product.merchantName = products[i].merchantName;
        product.merchantId = products[i].merchantId;
        product.skuNo = products[i].outerId;
        product.barcode = products[i].barcode;

        resultList.push(product);
    }
}