//#import Util.js
//#import product.js
//#import PreSale.js
//#import login.js
//#import column.js
//#import brand.js
//#import price.js
//#import user.js
//#import DynaAttrUtil.js
//#import NoticeNotify.js
//#import inventory.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import $preSaleRule:libs/preSaleRule.jsx
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
//#import $oleTrialReport:services/TrialReportService.jsx


;(function () {

    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.functions.CommonFunctions
    );


    var res = CommonUtil.initRes(),
        data = {};
    // try {

    var productId = $.params.productId,
        imageSize = $.params.imageSize || "1000X800",
        barcode = $.params.barcode,
        merchantId = $.params.merchantId || $.getDefaultMerchantId(),
        loginUserId = LoginService.getFrontendUserId() || "-1";

    if (!productId) {
        CommonUtil.setErrCode(res, ErrorCode.product.E1M00004);
        return;
    }

    var product =ProductService.getProduct(productId);

    if (!product) {
        CommonUtil.setErrCode(res, ErrorCode.product.E1M00005);
        return;
    }

    //获取商品价格，会员价..根据skuId获取，如果不传skuId，则取默认的skuId
    var jProduct = $.JSONObject(product);
    var skuId = $.params.skuId || ProductService.getHeadSku(productId).id;
    var skuPrice = CommonUtil.getSkuPrice(product, skuId, loginUserId);
    var realMarketPrice=ProductService.getMarketPrice(product);
    //针对预售商品做相应处理
    skuPrice.marketPrice.unitPrice=realMarketPrice;
    var jRule = PreSaleService.getProductPreSaleRule(productId);
    var preSaleAttr = {};
    // $.log("rule=====" + jRule);
    if (!isEmptyObject(jRule)) {
        // $.log("jRule=" + JSON.stringify(jRule));
        var state = {};
        var now = Date.now();
        if (now < Number(jRule.depositBeginLongTime)) {
            state = {code: "0", des: "预售未开始", now: now};
        }
        if (now >= Number(jRule.depositBeginLongTime) && now < (Number(jRule.depositEndLongTime) + 30 * 60 * 1000)) {
            state = {code: "1", des: "订金支付时间", now: now};
        }
        if (now >= Number(jRule.depositEndLongTime) && now < Number(jRule.beginLongTime)) {
            state = {code: "4", des: "备货时间", now: now};
        }
        if (now >= Number(jRule.beginLongTime) && now <= Number(jRule.endLongTime)) {
            state = {code: "2", des: "尾款支付时间", now: now};
        }
        if (now > Number(jRule.endLongTime)) {
            state = {code: "3", des: "预售活动结束", now: now};
        }
        jRule.beginLongTimeDif = (Number(jRule.beginLongTime) - now) + "";
        jRule.endLongTimeDif = (Number(jRule.endLongTime) - now) + "";
        jRule.depositBeginLongTimeDif = (Number(jRule.depositBeginLongTime) - now) + "";
        jRule.depositEndLongTimeDif = (Number(jRule.depositEndLongTime) - now) + "";


        //查看当前绑定状态,用户登录才可以查看预售绑定状态,不登录则不进行这个判断
        var bindState = {};
        if (loginUserId) {
            var bindKey = NoticeNotifyService.getBindKey(productId, "preSale", loginUserId);
            if (bindKey && bindKey != "null") {
                bindState = {bindKey: bindKey, state: true, msg: "已设置提醒"};
            } else {
                bindState = {bindKey: "", state: false, msg: "未设置提醒"};
            }
        }
        //预售限量和可卖数
        var skuQty = SkuService.getSkuAllQuantity(skuId);
        // $.log("skuQty=="+JSON.stringify(skuQty));
        var limitAmount = 0;
        if (skuQty) {
            var values = skuQty.values;
            limitAmount = values["zeroSellableCount"] == undefined ? 0 : values["zeroSellableCount"];//限量：零负可卖数
        }


        // var limitAmount = InventoryService.getSkuZeroSellCount(productId, skuId);  //限量：零负可卖数
        var sellableAmount = InventoryService.getSkuSellableCount(productId, skuId); //预售剩余数量
        var bookAmount = PreSaleService.getBookAmount(productId);
        var preSellableAmount = 0;


        if (sellableAmount < bookAmount) {
            preSellableAmount = Number(sellableAmount);
        } else {
            preSellableAmount = Number(limitAmount) - Number(bookAmount);
        }

        jRule.limitAmount = limitAmount;
        jRule.preSellableAmount = preSellableAmount;

        $.log("jRule.approveState= " + jRule.approveState);
        var preAprState = jRule.approveState;

        preSaleAttr = {
            bookAmount: bookAmount,  //获取预定的人数
            jRule: jRule,
            state: state,
            bindState: bindState
        };


    }
    data.preSaleAttr = preSaleAttr;

    //预售 end


    //查看商品是否有促销活动
    var hasPromotion = false;
    var promotionRules = ProductService.getClassifiedPossibleRules(productId, product.merchantId, loginUserId);
    // $.log("promotionRules=" + JSON.stringify(promotionRules));
    if (!isEmptyObject(promotionRules)) {
        for (var k in promotionRules) {
            var value = promotionRules[k];
            if (!hasPromotion && value && Array.isArray(value)) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i] && value[i].displayInProductDetail) {
                        hasPromotion = true;
                        break;
                    }
                }
            }
        }
    }

    //查看是否设置促销提醒
    var promotionNotify = {};
    if (loginUserId) {
        var bindKey = NoticeNotifyService.getBindKey(productId, "promotion", loginUserId);
        if (bindKey && bindKey != "null") {
            promotionNotify = {bindKey: bindKey, state: true, msg: "已设置促销提醒"};
        } else {
            promotionNotify = {bindKey: "", state: false, msg: "未设置促销提醒"};
        }
    }

    //商品图片
    var images = [];
    var imgString = selfApi.CommonFunctions.getPicListSizeImages(jProduct, "attr_10000", imageSize, "/upload/nopic_120.gif") + "";
    if (imgString) {
        var tmpImg = imgString.substring(1, imgString.length - 1);

        if (tmpImg.indexOf(", ") > -1) {
            var img = tmpImg.split(", ");
            if (img) {
                for (var i = 0; i < img.length; i++) {
                    images.push({url: img[i]});
                }
            }
        } else {
            images.push({url: tmpImg});
        }
    }


    //品牌
    var brand = BrandService.getBrand(product.brandColumnId);
    var sellableAmount = InventoryService.getSkuSellableCount(productId, skuId);  //获取可卖数
    // var sellableAmount = ProductService.getRealAmount(productId, skuId);  //获取库存

    //查看用户是否设置了到货提醒
    var arrivalNotify = {};
    if (loginUserId) {
        var bindKey = NoticeNotifyService.getBindKey(productId, "arrival", loginUserId);
        if (bindKey && bindKey != "null") {
            arrivalNotify = {bindKey: bindKey, state: true, msg: "已设置到货提醒"};
        } else {
            arrivalNotify = {bindKey: "", state: false, msg: "未设置到货提醒"};
        }
    }


    //获取收藏状态
    var favoriteTypeList = FavoriteProductTypeService.getListByUserId(loginUserId, 0, -1);
    var isKeep = false;
    for (var i = 0; i < favoriteTypeList.length; i++) {
        var favoriteObj = favoriteTypeList[i];
        if (!isEmptyObject(favoriteObj)) {
            var favoriteTypeId = favoriteObj.id;
            var productObj = FavoriteProductTypeService.getProductById(favoriteTypeId, productId);
            if (productObj != null) {
                isKeep = true;
                break;
            }
        }
    }

    //国家 产地  销售单位  保质期 规格 TODO:如果未配置相应全局变量，返回数据里面添加相应提示信息
    // var countryAttrId = GlobalVariableManagementService.getValueByName("productForeignCountryNameAttrId");
    var countryAttrId = GlobalVariableManagementService.getValueByName("countryAttrId");   //TODO 生产环境下需要修改
    var originPlaceId = GlobalVariableManagementService.getValueByName("ole_orginPlaceAttrId");
    var sellUnitId = GlobalVariableManagementService.getValueByName("ole_sellUnit");
    var shelfLifeId = GlobalVariableManagementService.getValueByName("ole_shelf_life");
    var specId = GlobalVariableManagementService.getValueByName("ole_spec");


    var dynaAttrs = product.DynaAttrs;
    var countryName = "",
        countryImgUrl = "",
        country = {},
        originPlace = "",
        sellUnit = "",
        shelfLife = "",
        spec = "";
    if (!isEmptyObject(dynaAttrs)) {
        for (var k in dynaAttrs) {
            if (k == countryAttrId) {
                countryName = dynaAttrs[k].value;
                if (countryName) {
                    countryImgUrl = GlobalVariableManagementService.getValueByName(countryName);
                    var countryCName = CountryManagementService.getValueByName(countryName) || "";
                    country = {name: countryName, imgUrl: countryImgUrl, CName: countryCName};
                }
            } else if (k == originPlaceId) {
                originPlace = dynaAttrs[k].value;
            } else if (k == sellUnitId) {
                sellUnit = dynaAttrs[k].value;
            } else if (k == shelfLifeId) {
                shelfLife = dynaAttrs[k].value;
            } else if (k == specId) {
                spec = dynaAttrs[k].value;
            } else {
            }
        }
    }


    //手机图文详情，需要获取img标签中的src属性
    var mobileContentHTML = product.mobileContent;
    var mobileContent = [];
    if (mobileContentHTML) {
        mobileContentHTML = mobileContentHTML.replace(/\'/g, "\"");//将单引号替换成双引号
        var reg = /<img src=\"([^\"]*)/gi;
        var s = mobileContentHTML.match(reg);
        if (s) {
            for (var i = 0; i < s.length; i++) {
                if (s[i].toLowerCase().indexOf("http://") > -1) {
                    var url = s[i].substring(s[i].toLowerCase().indexOf("http://"));
                    mobileContent.push({url: url});
                }
                if (s[i].toLowerCase().indexOf("https://") > -1) {
                    var url = s[i].substring(s[i].toLowerCase().indexOf("https://"));
                    mobileContent.push({url: url});
                }
            }
        }
    }

    //是否有通过审核的试用报告
    var hasTrialReports = TrialReportUtilService.getNumInfo(productId);  //沈超


    data.images = images;
    data.name = product.name;
    data.id = productId;
    data.brand = {id: brand.id, name: brand.name}; //品牌
    data.sellableAmount = sellableAmount; //可卖数
    data.hasPromotion = hasPromotion;
    data.keepInfos = {isKeep: isKeep, des: isKeep ? "已收藏" : "未收藏"}; //收藏状态
    data.temperatureControl = getTmpratureControl(product);  //温控属性
    data.country = country;
    data.originPlace = originPlace; //产地
    data.sellUnit = sellUnit; //销售单位
    data.shelfLife = shelfLife; //保质期
    data.spec = spec; //规格
    data.mobileContent = mobileContent; //手机版图文详情
    data.sellingPoint = product.sellingPoint;  //卖点
    data.tag = product.tag; //标签，用空格分隔多个标签
    data.merchantId = product.merchantId;  //商家ID
    data.skuPrice = skuPrice;
    data.arrivalNotify = arrivalNotify;  //是否设置了到货提醒
    data.promotionNotify = promotionNotify;  //是否设置了促销提醒
    data.hasTrialReports = hasTrialReports;
    data.isVirtual = product.isVirtual || "0";//0:普通商品，1：虚拟商品

    CommonUtil.setRetData(res, data);

    // } catch (e) {
    //     $.log(e);
    //     CommonUtil.setErrCode(res, ErrorCode.product.E1Z00002, e + "");
    // }
})();

/**
 * @param product
 * @returns {*}
 */
function getTmpratureControl(product) {
    var temperatureControl = product.temperatureControl;
    var tempratrueObj = {};
    if (temperatureControl == "02") {
        tempratrueObj.state = "2";
        tempratrueObj.des = "冷藏";
    } else if (temperatureControl == "03") {
        tempratrueObj.state = "3";
        tempratrueObj.des = "冷冻";
    } else {
        tempratrueObj.state = "1";
        tempratrueObj.des = "常温";
    }
    return tempratrueObj;
}

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};