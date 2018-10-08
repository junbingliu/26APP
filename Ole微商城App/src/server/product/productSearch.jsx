//#import Util.js
//#import inventory.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import merchant.js
//#import statistics.js
//#import session.js
//#import product.js
//#import price.js
//#import PreSale.js
//#import @server/util/CommonUtil.jsx

/**
 * 商品关键字搜索
 * @author fuxiao
 * @email fuxiao9@crv.com.cn
 * @date 2017-07-31
 */
;(function () {

    var userId = LoginService.getFrontendUserId() || "";
    var page = $.params.pageNum || 1;
    var size = $.params.limit || 20;
    var channel = $.params.channel || "";//商品发布渠道
    var from = page * size - size;

    // 构建查询参数
    var searchArgs = {
        "keyword": $.params["keyword"] || "", // 搜索关键字
        "fromPath": from, // 开始行数
        "fetchCount": size, // 分页数量
        "showState": "m",
        "publishState": 1
    };

    // 添加商家查询条件: 当商家ID为空时, 获取OLE送商家主分类ID
    var merchantId = $.params["mid"]; // 商家ID
    if (!merchantId) {
        // 默认从系统配置中获取OLE默认商家ID
        searchArgs["merchantId"] = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");
    } else {
        searchArgs["merchantId"] = merchantId;
    }

    // else { // 当商家ID为空是, 默认按照OLE商家主分类的ID查询商品

    //      从系统参数设置中获取OLE送的商家主分类
    //      var oleMainColumn = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "EWJ_OLE");
    //      $.log("\n\n\n ole main column id = " + oleMainColumn + "\n\n\n");
    //      searchArgs["mainColumn"] = oleMainColumn // OLE送商家主分类
    // }

    // 添加商品分类查询参数
    var columnId = $.params.columnId || "c_10000";
    searchArgs["path"] = columnId; // 商品分类, 如果不传商品分类，就搜索所有商品

    // 商品是否有货
    var regionId = $.params.regionId || ""; // 是否有货

    // 添加品牌查询条件
    var brandIds = $.params.brandIds;
    if (brandIds) {
        var ids = [];
        var splitBrand = brandIds.split("--");  //前台传参用--来隔离每个id
        for (var i = 0; i < splitBrand.length; i++) {
            ids.push(splitBrand[i]);
        }
        searchArgs["brands"] = ids;
    }
    if (channel) {
        searchArgs.channel = channel;
    }

    searchArgs.sortFields = [];
    searchArgs.sortFields.push({field: "isStockout", type: "LONG", reverse: false});//先按是否有货排序

    // 添加搜索排序
    var orderBy = $.params.orderBy || "default";
    if (orderBy === 'saleCount') {
        searchArgs.sortFields.push({field: "salesCount", type: "LONG", reverse: true});
    } else if (orderBy === 'priceHigh') {
        searchArgs.sortFields.push({field: "price", type: "LONG", reverse: false});
    } else if (orderBy === 'priceLow') {
        searchArgs.sortFields.push({field: "price", type: "LONG", reverse: true});
    } else if (orderBy === 'publishTime') {
        searchArgs.sortFields.push({field: "lastModifyTime", type: "STRING", reverse: true});
    } else if (orderBy === 'default' || (!$.params["keyword"] && !orderBy)) { //如果选中了默认排序或者关键字为空并且没有选其他排序方式
        var sortKey = "";
        if (merchantId) {
            sortKey = merchantId + "_" + columnId + "_PosOrder";
        } else {
            sortKey = "head_merchant_" + columnId + "_PosOrder"
        }
        searchArgs.sortFields.push({field: sortKey, type: "LONG", reverse: false});
        searchArgs.sortFields.push({field: "lastModifyTime", type: "STRING", reverse: true});
    }
    searchArgs.sortFields.push({field: "score", type: "LONG", reverse: true}); // 再按相关度排序

    $.log("\n\n\n productsSearchArg -> " + JSON.stringify(searchArgs) + "\n\n\n");

    searchArgs["withoutColumnIds"] = ["c_2410000"];//不搜索生产环境赠品分类下的商品

    var products = ProductService.search(searchArgs);
    var total = products.length;

    // $.log("\n\n\n products -> " + JSON.stringify(products) + "\n\n\n");

    var productData = [];
    if (products) {
        for (var i = 0, len = products.length; i < len; i++) {
            var product = products[i];
            var productId = product["objId"];
            var pMerchantId = product["merchantId"];
            var marketPrice = ""; // 大字价格
            var memberPrice = ""; // 小字价格
            var memberIcon = -1;  // 会员等级

            var preSaleRule = PreSaleService.getProductPreSaleRule(productId); // 预售状态: true 预售商品, false 非预售商品
            var preSaleState = !!(preSaleRule && preSaleRule.approvestate === 1
                && preSaleRule.depositEndLongTime
                && (preSaleRule.depositEndLongTime - (new Date()).getTime()) > 0); // 预售状态 === 生效状态, 预售结束日期(定金支付结束日期) < 当前日期
            var preSalePrice = preSaleState ? preSaleRule.totalPrice : ""; // 预售价格

            if (preSaleState) { // 预售商品只获取预售价格
                preSalePrice = preSaleRule.totalPrice || "";
            } else {
                var cxt = "{attrs:{},factories:[{factory:MF},{factory:RPF}]}";
                var productPrices = ProductService.getPriceValueList(productId, "", pMerchantId, 1, cxt, "normalPricePolicy");
                marketPrice = productPrices[0]&&productPrices[0].formatUnitPrice || "";
                memberPrice = productPrices[1]&&productPrices[1].formatUnitPrice || "";

            }

            // 根据是否有货参数查询商品是否有货信息
            var productCanDelivery = {};

            marketPrice = (marketPrice === "" && memberPrice === "") ? "暂无价格" : marketPrice;

            var spec = $.params.spec || "345X370"; // 图片规格
            var productItem = {
                "productId": productId,
                "name": product.name,
                "sellingPoint": product.sellingPoint, // 产品特色
                "productImage": ProductService.getProductLogo(product, spec, ""),
                "memberPrice": memberPrice, // 小字价格
                "marketPrice": marketPrice, // 大字价格
                "memberLv": memberIcon, // 会员等级
                // "hasSpecialPrice": hasSpecialPrice, // 商品是否包含特殊价格
                // "sellAbleCount": InventoryService.getProductSellableCount(product), // 可卖数
                "productCanDelivery": productCanDelivery,
                "preSaleState": preSaleState, // 商品预售标记
                "preSalePrice": preSalePrice, // 商品预售价格
                "preSaleRule": preSaleRule
            };
            productData.push(productItem);
        }

        setResultInfo("S0A00000", "success", {
            products: productData,
            total: total
        })
    } else {
        setResultInfo("E1B0001", "error")
    }
})();

// 返回函数
function setResultInfo(code, msg, data) {
    // 设置返回格式
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}
