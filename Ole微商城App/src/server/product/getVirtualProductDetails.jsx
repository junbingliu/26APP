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
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx


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

    var jProduct = ProductApi.ProductFunction.getProduct(productId);

    if (!jProduct) {
        CommonUtil.setErrCode(res, ErrorCode.product.E1M00005);
        return;
    }

    //获取商品价格，会员价..根据skuId获取，如果不传skuId，则取默认的skuId
    var product = JSON.parse(jProduct.toString());
    var skuId = $.params.skuId || ProductService.getHeadSku(productId).id;
    var skuPrice = getSkuPrice(product, skuId, loginUserId);


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
    var mobileContentHTML = product.mobileContent || "";

    data.images = images;
    data.name = product.name;
    data.id = productId;
    data.brand = {id: brand.id, name: brand.name}; //品牌
    data.sellableAmount = sellableAmount; //可卖数
    data.keepInfos = {isKeep: isKeep, des: isKeep ? "已收藏" : "未收藏"}; //收藏状态
    data.country = country;
    data.originPlace = originPlace; //产地
    data.sellUnit = sellUnit; //销售单位
    data.shelfLife = shelfLife; //保质期
    data.spec = spec; //规格
    data.mobileContent = []; //手机版图文详情
    data.mobileContentHTML = mobileContentHTML; //手机版图文详情
    data.sellingPoint = product.sellingPoint;  //卖点
    data.tag = product.tag; //标签，用空格分隔多个标签
    data.merchantId = product.merchantId;  //商家ID
    data.skuPrice = skuPrice;
    data.isVirtual = product.isVirtual || "0";//0:普通商品，1：虚拟商品


    CommonUtil.setRetData(res, data);

    // } catch (e) {
    //     $.log(e);
    //     CommonUtil.setErrCode(res, ErrorCode.product.E1Z00002, e + "");
    // }
})();


function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

function getSkuPrice(product, skuId, loginUserId) {
    var cxt = "{attrs:{},factories:[{factory:MF},{factory:INPF}]}";//市场价和积分价
    var newProductPrices = ProductService.getPriceValueList(product.objId, loginUserId, product.merchantId, 1, cxt, "normalPricePolicy");
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
    var retPrices = {};
    retPrices.marketPrice = marketPrice;
    retPrices.cashPrice = cashPrice;
    retPrices.cashPriceString = cashPriceString;
    retPrices.integralPrice = integralPrice;
    retPrices.integralPriceString = integralPriceString;
    retPrices.loginUserId = loginUserId;
    return retPrices;
};