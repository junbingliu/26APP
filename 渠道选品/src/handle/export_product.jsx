//#import excel.js
//#import Util.js
//#import column.js
//#import DateUtil.js
//#import product.js
//#import sysArgument.js
(function () {
    var isSearch = false;
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"] || "";
    var beginTime = $.params["beginTime"];
    var endTime = $.params["endTime"];
    var productId = $.params["productId"] || "";
    var channel = $.params["channel"] || "";
    var publishState = $.params["publishState"] || "";
    var showState = $.params["showState"] || "";
    var totalRecords = 0;
    var resultList = [];
    var tempResult;

    if (keyword != "") {
        isSearch = true;
    }
    if (!beginTime || beginTime != "") {
        isSearch = true;
    }
    if (!endTime || endTime != "") {
        isSearch = true;
    }
    if (!productId || productId != "") {
        isSearch = true;
    }
    if (!channel || channel != "") {
        isSearch = true;
    }
    if (!publishState || publishState != "") {
        isSearch = true;
    }
    // var jMerchant = MerchantService.getMerchant(merchantId);
    var ole_merchantId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");


    if (isSearch) {
        var result = searchA(tempResult, keyword, beginTime, endTime, productId, channel, publishState, 1, 100, ole_merchantId);
        totalRecords = Math.ceil(result.total / 100);
        $.log(".................totalRecords:" + totalRecords);
        for (var y = 1; y < totalRecords + 1; y++) {
            result = searchA(tempResult, keyword, beginTime, endTime, productId, channel, publishState, y, 100, ole_merchantId);
            transform(result.products, resultList);
        }
    } else {
        result = ProductService.getProductsOfColumn("c_10000", ole_merchantId, 0, -1);
        if (result && result.length > 0) {
            var temp = {products: result};
            transform(temp.products, resultList);
        }
    }
    var export_fileName = $.params["export_fileName"];
    var fileName = export_fileName ? export_fileName : DateUtil.getLongDate(new Date());
    var export_file_type = "channel_productList";
    var index = 0;
    var titleList = [
        {"index": index++, "columnWidth": "15", "field": "productId", "title": "商品ID"},
        {"index": index++, "columnWidth": "15", "field": "skuNo", "title": "sku编码"},
        {"index": index++, "columnWidth": "30", "field": "productName", "title": "商品名称"},
        {"index": index++, "columnWidth": "25", "field": "categoryName", "title": "分类"},
        {"index": index++, "columnWidth": "30", "field": "channelName", "title": "所属渠道"},
        {"index": index++, "columnWidth": "15", "field": "merchantName", "title": "所属商家"},
        {"index": index++, "columnWidth": "15", "field": "publishStateName", "title": "是否在售"},
        {"index": index++, "columnWidth": "15", "field": "sellableCount", "title": "可卖数"},
    ];
    Excel.createExcelList(merchantId, fileName, export_file_type, titleList, resultList);
    var pageData = {
        state: "ok",
        msg: fileName
    };
    out.print(JSON.stringify(pageData));
})();

function transform(products, resultList) {
    for (var i = 0; i < products.length; i++) {
        var column = ColumnService.getColumn(products[i].columnId);
        var product = {};
        product.skuNo = products[i].outerId;
        product.productId = products[i].productId;
        product.productName = products[i].name;
        product.categoryName = column.name;
        product.channel = products[i].channel || "";
        product.channelName = product.channel == "app" ? "APP" : (product.channel == "h5" ? "微商城" : (product.channel == "all" ? "APP,微商城" : ""));
        product.publishState = products[i].publishState;
        product.publishStateName = products[i].publishState == "1" ? "是" : "否";
        product.sellableCount = products[i].sellableCount;
        product.merchantName = products[i].merchantName;
        product.merchantId = products[i].merchantId;
        resultList.push(product);
    }
}

function searchA(result, keyword, beginTime, endTime, productId, channel, publishState, page, pageLimit, merchantId) {

    var searchArgs = {};
    searchArgs.keyword = keyword || "";//关键字
    if (beginTime != "") {
        var beginTimeTemp = beginTime + " 00:00:00"
    } else {
        beginTime = "";
    }
    if (endTime != "") {
        var endTimeTemp = endTime + " 23:59:59"
    } else {
        endTime = "";
    }
    searchArgs.beginCreateTime = beginTimeTemp;//开始时间
    searchArgs.endCreateTime = endTimeTemp;//截止时间
    searchArgs.id = productId || "";//商品Id
    if (channel != "NO") {
        searchArgs.channel = channel;//渠道
    }
    searchArgs.publishState = publishState || "";//上下架状态
    searchArgs.page = page;//页码,从1开始
    searchArgs.page_size = pageLimit;//每页多少条

    if (merchantId && merchantId != "head_merchant") {
        searchArgs.merchantId = merchantId;
    }
    searchArgs.fields = "productId,name,sellableCount,merchantName,merchantId,channel,columnId,publishState,outerId";
    searchArgs.sortFields = [{
        field: "",
        type: "LONG",
        reverse: false
    }, {field: 'createTime', type: 'STRING', reverse: true}];
    result = ProductService.searchProduct(searchArgs);
    if (channel == "NO") {
        var tempProductList = [];
        var productList = result.products;
        for (var t = 0; t < productList.length; t++) {
            if (!productList[t].channel) {
                tempProductList.push(productList[t])
            }
        }
        result.products = tempProductList;

    }
    return result;
}