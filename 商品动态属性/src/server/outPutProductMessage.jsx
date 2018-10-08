//#import Util.js
//#import jobs.js
//#import excel.js
//#import file.js
//#import product.js
//#import sku.js
//#import brand.js
//#import price.js
//#import user.js
//#import inventory.js
(function () {
    try {
        var titles = $.params.titles || "[]";
        var fileName = $.params.fileName || "";
        var keyword = $.params.keyword || "", beginCreateTime = $.params.beginCreateTime || "", endCreateTime = $.params.endCreateTime || "";
        var m = $.params["m"];
        if (!m) {
            m = $.getDefaultMerchantId();
        }
        var jobPageId = "server/doExportUser.jsx";
        JobsService.runNow(appId, jobPageId, {
            isRun: "true",
            titles: titles,
            fileName: fileName,
            m: m,
            keyword: keyword,
            beginCreateTime: beginCreateTime,
            endCreateTime: endCreateTime
        });
        var res = {};
        res.state = "ok";
        res.msg = "已提交到任务，请几分钟后到导出历史上查看";
        out.print(JSON.stringify(res));
    }
    catch (e) {
        var res = {};
        res.state = "err";
        res.msg = "异常";
        out.print(JSON.stringify(res));
    }



    //function getSecuritySellPrice(product) {
    //    var price = product.price;
    //    if (!price) {
    //        return null;
    //    }
    //    for (k in price.values) {
    //        var skuValues = price.values[k];
    //        var key = ProductService.getPriceValueKey("entitytype_other", "entity_securitySellPrice");
    //        var prices = skuValues[key];
    //        //在多个prices中找到我们想要的
    //        if (prices) {
    //            for (var i = 0; i < prices.length; i++) {
    //                var p = prices[i];
    //                if (p.payable == 'N' && p.moneyTypeId == 'moneytype_RMB') {
    //                    return p.unitPrice / 100;
    //                }
    //            }
    //        }
    //    }
    //    return null;
    //}//最低安全售价
    //function loadPoduct(keyword, beginCreateTime, endCreateTime) {
    //    var searchResult;
    //    var jSearchArg = {};
    //    if (keyword != "") {
    //        jSearchArg.keyword = keyword;
    //    }
    //    if (beginCreateTime != "") {
    //        jSearchArg.beginCreateTime = beginCreateTime;
    //
    //    }
    //    if (endCreateTime != "") {
    //        jSearchArg.endCreateTime = endCreateTime;
    //
    //    }
    //    jSearchArg.page = 1;
    //    jSearchArg.page_size = 10;
    //    searchResult = ProductService.searchProduct(jSearchArg);
    //    //var total = searchResult.total;
    //    var total = 10;
    //    var productIds = [];
    //    var totalPage = 0;
    //    for (var i = 1; i < total / jSearchArg.page_size + 1; i++) {
    //        totalPage = i;
    //    }
    //    for (var p = 1; p <= totalPage; p++) {
    //        jSearchArg.page = p;
    //        searchResult = ProductService.searchProduct(jSearchArg);
    //        for (var o in searchResult.products) {
    //            productIds.push(searchResult.products[o]);
    //        }
    //    }
    //    var products = [];
    //    for (var i = 0; i < productIds.length; i++) {
    //        var productId = productIds[i].productId;
    //        var product = ProductService.getProduct(productId);
    //        var user = {};
    //        user.productId = productId;//商品ID
    //        user.productNumber = product.productNumber;//货号;
    //        var Head_sku = ProductService.getHeadSku(productId);//默认sku;
    //        user.Head_sku_id = Head_sku.id;//默认sku内部Id;
    //        user.Head_skuId = Head_sku.skuId;//默认sku外部Id;
    //        user.Head_barcode = Head_sku.barcode;//默认sku条形码;
    //        var skus = ProductService.getSkus(productId);//sku;
    //        var jRatio;
    //        for (var s = 0; s < skus.length; s++) {
    //            var sku = skus[s];
    //            jRatio = SkuService.getRatio(sku.id);
    //
    //            if (s == 0) {
    //                user.sku_id = sku.id;
    //                user.skuId = sku.skuId;
    //                user.barcode = sku.barcode;//条形码
    //                if (jRatio) {
    //                    var baseSkuId = jRatio.baseSkuId;
    //                    user.baseSkuId = baseSkuId;//基准sku内部ID
    //                    user.baseRealSkuId = SkuService.getSkuBySkuIdEx(baseSkuId).skuId;//基准sku编码
    //                }
    //                else {
    //                    user.baseSkuId = "";//基准sku内部ID
    //                    user.baseRealSkuId = "";//基准sku编码
    //                }
    //            }
    //            else {
    //                user.sku_id = user.sku_id + "，" + sku.id;
    //                user.skuId = user.skuId + "，" + sku.skuId;
    //                user.barcode = user.barcode + "，" + sku.barcode;
    //                if (jRatio != null) {
    //                    var baseSkuId = jRatio.baseSkuId;
    //                    user.baseSkuId = user.baseSkuId + "," + baseSkuId;//基准sku内部ID
    //                    user.baseRealSkuId = user.baseRealSkuId + "，" + SkuService.getSkuBySkuIdEx(baseSkuId).skuId;//基准sku编码
    //                }
    //                else {
    //                    user.baseSkuId = user.baseSkuId + "，" + "";//基准sku内部ID
    //                    user.baseRealSkuId = user.baseRealSkuId + "，" + "";//基准sku编码
    //                }
    //
    //            }
    //
    //        }
    //
    //        user.name = product.name;//商品名
    //        if(MerchantService.getMerchant(product.merchantId)){
    //            user.merchant = MerchantService.getMerchant(product.merchantId).name_cn;//商家
    //        }
    //        else{
    //            user.merchant ="";
    //        }
    //        user.columnId = product.columnId;//分类Id
    //        var column = ProductService.getColumn(user.columnId);
    //        if (column != undefined) {
    //            user.columnName = column.name;//分类名
    //        }
    //        else {
    //            user.columnName = ""
    //        }
    //        var Brand = BrandService.getBrand(product.brandColumnId);
    //        if (Brand) {
    //            user.brandName = Brand.name;//品牌
    //        }
    //        user.warehouseType = product.warehouseType || ""   //仓库属性
    //        user.temperatureControl = product.temperatureControl || ""  //温控
    //        if (product.temperatureControl) {
    //            if (product.temperatureControl == "01") {
    //                user.temperatureControl = "常温";
    //            }
    //            else if (product.temperatureControl == "02") {
    //                user.temperatureControl = "冷藏";
    //            }
    //            else if (product.temperatureControl == "03") {
    //                user.temperatureControl = "冷冻";
    //            }
    //        }
    //        user.weight = product.weight || ""   //重量
    //        user.volume = product.volume || ""   //体积
    //        user.length = product.length || ""   //长
    //        user.wide = product.wide || ""   //宽
    //        user.high = product.high || ""   //高
    //        user.SellableCount = ProductService.getSellableCount(productId, user.Head_sku_id);//可卖数
    //        user.sellState = ProductService.getPublishState(product);//在售状态
    //        if(product.noversion.certifyState){
    //            if(product.noversion.certifyState=="0"){
    //                user.certifyState="未审核";
    //            }
    //            else if(product.noversion.certifyState=="1"){
    //                user.certifyState="审核通过";
    //            }
    //            else if(product.noversion.certifyState=="1"){
    //                user.certifyState="审核不通过";
    //            }
    //        }
    //        else{
    //            user.certifyState="";
    //        }
    //
    //
    //        //user.certifyState = product.noversion.certifyState == "1" ? "审核" : "未审核"  //审核状态
    //        user.selfState = product.noversion.publishState == "1" ? "上架" : "下架"; //上架状态
    //        var jInventory = InventoryService.getSkuInventory(productId, user.Head_sku_id);//库存
    //        user.zeroSellable = jInventory.zeroSellable == "0" ? "否" : "是"   //是否零负可卖
    //        user.zeroSellCount = jInventory.zeroSellCount;   //零负可卖数量
    //        user.SecuritySellableCount = jInventory.securitySellableCount;   //安全可卖数
    //        user.utilPrice = ProductService.getRealPayPrice(product.createUserId, product.merchantId, productId, user.Head_sku_id) / 100;//售价
    //        user.marketPrice = ProductService.getMarketPrice(product) || "";//市场价
    //        user.memberPrice = ProductService.getMemberPrice(product) || "";//会员价
    //        user.securitySellPrice = getSecuritySellPrice(product);      //最低安全售价
    //        //user.      //原价
    //        //user.     //总送积分
    //        user.createPeople = UserService.getUser(product.createUserId).realName || ""  //创建人
    //        user.createTime = product.createTime//创建时间
    //        user.tag = product.tag || ""       //标签
    //        user.sellingPoint = product.sellingPoint;        //卖点
    //        var attrs = ProductService.getProductAttrs(product);       //动态属性
    //        user.attrs = ""
    //        for (var j = 0; j < attrs.length; j++) {
    //            var attr = attrs[j];
    //            user.attrs += attr.name + "：" + attr.value + "， "
    //
    //        }
    //
    //        products.push(user);
    //    }
    //    return products;
    //}
    //
    //var product = loadPoduct("UAT-oms测试土猪肉", "", "");
    //out.print(JSON.stringify(product));
})()