//#import doT.min.js
//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import productCredit.js
//#import column.js
//#import search.js
//#import file.js
//#import account.js
//#import @server/util/H5CommonUtil.jsx

(function () {
    var keyword = $.params.keyword || "";
    var integralType = $.params.integralType || "";
    var page = $.params.page || 1;
    var displayStyle = $.params.displayStyle || "P";
    var spec = $.params.spec || "220X220";
    var showState = "s";
    var columnId = $.params.cid || "c_10000";
    var brandId = $.params.brandId || ""
    var orderBy = $.params.orderBy;
    var lowTotalPrice = $.params.lowTotalPrice;
    var highTotalPrice = $.params.highTotalPrice;
    var beginIntegral = $.params.beginIntegral;
    var endIntegral = $.params.endIntegral;
    var otherParams = $.params.otherParams;
    var userId = LoginService.getFrontendUserId();

    var user = LoginService.getFrontendUser();
    var alreadyLogin = false;
    if (user != null) {
        alreadyLogin = true;
    }

    //获取面包线数据
    var curColumn = ColumnService.getColumn(columnId);
    var position = [];
    position.push({id: curColumn.id, title: curColumn.title});
    var safeCount = 10;
    while (curColumn.parentId != "col_ProductRoot") {
        curColumn = ColumnService.getColumn(curColumn.parentId);
        position.unshift({id: curColumn.id, title: curColumn.title});
        if (safeCount < 0) {
            //超出10层了
            break;
        }
        safeCount--;
    }

    var searchArgs = {
        keyword: keyword,
        fromPath: (page - 1) * 20,
        fetchCount: 20,
        publishState:1,
        path: columnId,
        brandId: brandId,
        isIntegralBuy: "Y",
        integralType: integralType//积分商品分类
    };
    if (otherParams) {
        var arrayOtherParams = otherParams.split("--");
        var sOtherParams = '{"' + arrayOtherParams[0] + '_multiValued":"' + arrayOtherParams[1] + '"}';

        var jOtherParams = JSON.parse(sOtherParams);
        searchArgs.otherParams = jOtherParams;
    }
    if (lowTotalPrice) {
        searchArgs.lowTotalPrice = parseFloat(lowTotalPrice * 100);
    }
    if (highTotalPrice) {
        searchArgs.highTotalPrice = parseFloat(highTotalPrice * 100);
    }
    if (beginIntegral) {
        searchArgs.lowIntegralBuyPrice = parseFloat(beginIntegral * 100);
    }
    if (endIntegral) {
        searchArgs.highIntegralBuyPrice = parseFloat(endIntegral * 100);
    }


    if (keyword) {
        searchArgs.hightlight_keyword = keyword;
        searchArgs.hightlight_field = "name_highlight";
    }

    if (orderBy == 'saleCountHigh') {
        searchArgs.sortFileds = [{
            field: "salesCount",
            type: "LONG",
            reverse: true
        }];
    }
    if (orderBy == 'saleCountLow') {
        searchArgs.sortFileds = [{
            field: "salesCount",
            type: "LONG",
            reverse: false
        }];
    }
    if (orderBy == 'priceHigh') {
        searchArgs.sortFields = [{
            field: "integral_buyPrice",
            type: "LONG",
            reverse: true
        }];
    }
    if (orderBy == 'priceLow') {
        searchArgs.sortFields = [{
            field: "integral_buyPrice",
            type: "LONG",
            reverse: false
        }];
    }
    if (orderBy == 'publishTimeHigh') {
        searchArgs.sortFields = [{
            field: "lastModifyTime",
            type: "LONG",
            reverse: true
        }];
    }
    if (orderBy == 'publishTimeLow') {
        searchArgs.sortFields = [{
            field: "lastModifyTime",
            type: "LONG",
            reverse: false
        }];
    }

    var cxt = "{attrs:{},factories:[{factory:MF},{factory:INPF}]}";//市场价和积分价

    var searchArgsString = JSON.stringify(searchArgs);
    var javaArgs = ProductApi.ProductSearchArgs.getFromJsonString(searchArgsString);
    var results = ProductApi.IsoneFulltextSearchEngine.searchServices.search(javaArgs);
    var pageNum = parseInt((results.getTotal() + 20 - 1) / 20);
    var ids = results.getLists();

    var listOfJSON = ProductApi.IsoneModulesEngine.productService.getListDataByIds(ids, false);
    if (spec) {
        ProductApi.IsoneModulesEngine.productService.getLogosOfProducts(listOfJSON, spec);
    }
    var s = listOfJSON.toString();
    var products = JSON.parse(s);
    var priceIds = new ProductApi.ArrayList();
    for (var i = 0; i < products.length; i++) {
        priceIds.add(products[i].priceId);
    }
    var jprices = ProductApi.IsoneModulesEngine.priceService.getListDataByIds(priceIds, true);
    var prices = JSON.parse(jprices.toString());
    for (var i = 0; i < products.length; i++) {
        products[i].price = prices[i];
    }

    if (products) {
        products = products.map(function (product) {
            /*获取促销图标*/
            var promotionLogos = ProductService.getPromotionLogo(product.objId);
            var skus = ProductService.getSkus(product.objId);
            var validSkus = [];
            if (skus.length > 1) {
                skus.forEach(function (sku) {
                    if (!sku.isHead) {
                        validSkus.push(sku);
                    }
                });
            }
            else if (skus.length == 1) {
                validSkus.push(skus[0]);
            }

            var inventoryAttrs = ProductService.getInventoryAttrs(product, "140X140");
            if (promotionLogos && promotionLogos.length > 0) {
                var promotionLogo = promotionLogos[0].fullpath;
            }
            /*获取商品会员价*/
            var newProductPrices = ProductService.getPriceValueList(product.objId, userId, product.merchantId, 1, cxt, "normalPricePolicy");
            var marketPrice = "暂无价格";
            var integralPrice = "";
            var cashPrice = "";
            var integralPriceString = "";
            var cashPriceString = "";
            if (newProductPrices && newProductPrices.length > 0) {
                if (newProductPrices[0] != null) {
                    marketPrice = newProductPrices[0] && newProductPrices[0].formatUnitPrice;//市场价
                    if (marketPrice) {
                        marketPrice = parseFloat(marketPrice).toFixed(2);
                    } else {
                        marketPrice = "暂无价格";
                    }
                }

                if (newProductPrices.length > 1 && newProductPrices[1] != null) {
                    integralPrice = newProductPrices[1] && newProductPrices[1].formatIntegralPrice;//积分价
                    cashPrice = newProductPrices[1] && newProductPrices[1].formatUnitPrice;//现金价
                    if (integralPrice) {
                        integralPrice = parseFloat(integralPrice).toFixed(2);
                        integralPriceString = parseFloat(integralPrice).toFixed(2);
                    } else {
                        integralPriceString = "暂无价格";
                    }
                    if (cashPrice || cashPrice == "0") {
                        cashPrice = parseFloat(cashPrice).toFixed(2);
                        cashPriceString = parseFloat(cashPrice).toFixed(2);
                    } else {
                        cashPriceString = "暂无价格";
                    }
                }
            }
            var highlight = ProductApi.DiscoveryHelper.getHighLightText(results, javaArgs, product.objId, product.title1 && product.title1.value);
            product.title = "" + highlight;

            /*销售数*/
            var salesAmount = ProductService.getSalesAmount(product.objId) || 0;

            var title = product.title;
            var logos = product.logos;

            var jCredit = ProductCreditService.getCredit(product.objId);
            //平均得分
            var averageDescStore = ProductCreditService.getAverageTotalDescStore(jCredit);

            //评价数量
            var descAmount = ProductCreditService.getDescAmount(jCredit);
            //获取卖点
            var jProduct = ProductService.getProduct(product.objId);
            var sellingPoint = jProduct.sellingPoint;
            return {
                promotionLogo: promotionLogo || "",
                credit: {averageDescStore: averageDescStore, descAmount: descAmount},
                marketPrice: marketPrice,
                cashPrice: cashPrice,
                cashPriceString: cashPriceString,
                integralPrice: integralPrice,
                integralPriceString: integralPriceString,
                isVirtual: product.isVirtual || "0",
                title: title,
                logos: logos || "/upload/nopic_200.jpg",
                id: product.objId,
                salesAmount: salesAmount,
                merchantId: product.merchantId,
                sellingPoint: sellingPoint,
                sku: (validSkus),
                inventoryAttrs: (inventoryAttrs)
            }
        });
    }


    var data = {
        products: products,
        total: 0 + results.getTotal(),
        displayStyle: displayStyle,
        pageNum: pageNum,
        curPage: page
    };
    if (data.total == 0) {
        data.curPage = 0;
    }
    // out.print(JSON.stringify(result));
    H5CommonUtil.setSuccessResult(data);
})();
