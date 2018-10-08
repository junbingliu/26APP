//#import pigeon.js
//#import Util.js
//#import product.js
//#import sku.js
//#import inventory.js
//#import sku-store.js
//#import artTemplate3.mini.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx

(function () {
    var approvalState = $.params["approvalState"] || "";
    var isSearch = false;
    var currentPage = $.params["page"];
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"] || "";
    var beginCreateTime = $.params["beginCreateTime"] || "";
    var endCreateTime = $.params["endCreateTime"] || "";
    var showState = $.params["showState"] || "";
    if (!currentPage) {
        currentPage = 1;
    }

    var searchParams = {};
    //支付方式
    if (merchantId && merchantId != "head_merchant") {
        searchParams.merchantId = merchantId;
    }
    //审核状态
    if (approvalState && approvalState != "-1") {
        searchParams.approvalState = approvalState;
        isSearch = true;
    }
    //关键字
    if (keyword && keyword != "-1") {
        searchParams.keyword = keyword;
        isSearch = true;
    }
    //开始时间
    if (beginCreateTime && beginCreateTime != "") {
        searchParams.beginCreateTime = DateUtil.getLongTime(beginCreateTime);
        isSearch = true;
    }
    //结束时间
    if (endCreateTime && endCreateTime != "") {
        searchParams.endCreateTime = DateUtil.getLongTime(endCreateTime);
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 15;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var getSkuInventory = function (jProduct, jSku, isExchangeOMS) {
        if (!jSku || !jProduct) {
            return jProduct;
        }
        var skuId = jSku.id;
        jProduct.sku = jSku.skuId;
        jProduct.skuId = jSku.id;
        jProduct.zeroSellable = jSku.zeroSellable || "0";
        if (jProduct.zeroSellable == "1") {
            jProduct.zeroSellable = "是";
        } else {
            jProduct.zeroSellable = "否";
        }
        if (isExchangeOMS) {
            jProduct.isExchangeOMS = "是";
            var skuQty = SkuService.getSkuAllQuantity(skuId);
            if (skuQty) {
                var values = skuQty.values;
                if (values) {
                    jProduct.realAmount = values[defaultShipNode] == undefined ? "" : values[defaultShipNode];
                    jProduct.zeroSellableCount = values["zeroSellableCount"] == undefined ? "" : values["zeroSellableCount"];
                }
            }
        } else {
            jProduct.zeroSellableCount = InventoryService.getSkuZeroSellCount(jProduct.productId, jSku.id);//零负可卖
            jProduct.realAmount = ProductService.getRealAmount(jProduct.productId, jSku.id);//实际库存
            jProduct.isExchangeOMS = "<font color='red'>否</font>";
        }
        jProduct.sellableCount = InventoryService.getSkuSellableCount(jProduct.productId, jSku.id);//可卖数
        jProduct.freezeAmount = InventoryService.getSkuFreezeAmount(jProduct.productId, jSku.id);//冻结库存
        jProduct.securitySellableCount = InventoryService.getSecuritySellableCount(jProduct.productId, jSku.id);//安全可卖数（已减安全可卖数）
        return jProduct;
    };
    var resultList = [];
    if (true) {
        var searchArgs = {};
        searchArgs.keyword = keyword || "";//关键字
        searchArgs.page = currentPage;//页码,从1开始
        searchArgs.page_size = pageLimit;//每页多少条
        if (showState && showState != "-1") {
            searchArgs.sellState = showState;//显示状态，已上架的
        }
        if (merchantId && merchantId != "head_merchant") {
            searchArgs.merchantId = merchantId;
        }
        searchArgs.fields = "productId,name,memberPrice,sellableCount,merchantName,merchantId";
        searchArgs.sortFields = [{
            field: "head_merchant_c_10000_PosOrder",
            type: "LONG",
            reverse: false
        }, {field: 'createTime', type: 'STRING', reverse: true}];

        var result = ProductService.searchProduct(searchArgs);
        var products = result.products;
        totalRecords = result.total;
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            var productId = product.productId;
            var skus = ProductService.getSkus(productId);
            product.merchantName = product.merchantName + "(" + product.merchantId + ")";
            if (!skus) {
                continue;
            }
            var defaultShipNode = OmsControlArgService.getDefaultShipNode(product.merchantId) || "";
            var isExchangeOMS = OmsControlArgService.needExchangeToOms(product.merchantId);
            if (skus.length > 1) {
                for (var p = 0; p < skus.length; p++) {
                    var jSku = skus[p];
                    var tmpProduct = JSON.parse(JSON.stringify(product));
                    tmpProduct = getSkuInventory(tmpProduct, jSku, isExchangeOMS);
                    resultList.push(tmpProduct);
                }
            } else {
                product = getSkuInventory(product, skus[0], isExchangeOMS);
                resultList.push(product);
            }
        }
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


    searchParams.approvalState = approvalState;
    searchParams.keyword = keyword;
    searchParams.merchantId = merchantId;
    searchParams.beginCreateTime = beginCreateTime;
    searchParams.endCreateTime = endCreateTime;

    var source = $.getProgram(appMd5, "pages/load_list.jsxp");
    var pageData = {
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId,
        searchParam: searchParams
    };

    var render = template.compile(source);

    out.print(render(pageData));
})();