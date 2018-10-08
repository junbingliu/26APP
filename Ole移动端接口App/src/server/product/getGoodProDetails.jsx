//#import Util.js
//#import product.js
//#import column.js
//#import price.js
//#import file.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import DynaAttrUtil.js
//#import NoticeNotify.js
//#import sysArgument.js
//#import $preSaleRule:libs/preSaleRule.jsx
//#import $goodProductManage2:services/goodProductServices.jsx
//#import $oleMobileApi:services/ProductLikeUtilService.jsx
//#import $oleMobileApi:services/FavoriteGoodsService.jsx
(function () {
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.functions.CommonFunctions
    );
    var ret = ErrorCode.S0A00000;
    var imageSize = $.params["imageSize"] || "750X750";
    var loginId = LoginService.getFrontendUserId() || "";
    var activeId = $.params["activeId"];
    if(activeId.indexOf("goodProductManage2_") == -1){
        activeId = "goodProductManage2_"+activeId;
    }
    var obj = goodProductServices.getById(activeId);
    if(obj.headImageFileId){
        obj.headImage = FileService.getRelatedUrl(obj.headImageFileId,"750X420");
    }
    var beginTime = obj.beginTime+":00";
    var endTime = obj.endTime+":00";
    beginTime = DateUtil.getLongTime(beginTime,"yyyy-MM-dd HH:mm:ss");
    endTime = DateUtil.getLongTime(endTime,"yyyy-MM-dd HH:mm:ss");
    obj.beginTime = DateUtil.getStringDate(beginTime,"MM月dd日");
    obj.endTime = DateUtil.getStringDate(endTime,"MM月dd日");
    var arry = [];
    for(var a = 0; a < obj.productIds.length; a++){
        if(obj.productIds[a]){
            arry.push(obj.productIds[a]);
        }
    }
    obj.productIds = arry;

    for(var b = 0; b < obj.productIds.length; b++){
        var product = {};
        var images = [];
        if(obj.productIds[b]){
        var skuId = ProductService.getHeadSku(obj.productIds[b]).id;
        product = obj.productGroup[obj.productIds[b]];
        var productJavaObj = ProductApi.ProductFunction.getProduct(obj.productIds[b]);
        var imgString = selfApi.CommonFunctions.getPicListSizeImages(productJavaObj, "attr_10000", imageSize, "/upload/nopic_120.gif") + "";
        if (imgString) {
            var tmpImg = imgString.substring(1, imgString.length - 1);
            if (tmpImg.indexOf(", ") > -1) {
                var img = tmpImg.split(", ");
                if (img) {
                    for (var i = 0; i < img.length; i++) {
                        images.push(img[i]);
                    }
                }
                    if(product.productHeadImgFileId){
                        images.unshift(FileService.getRelatedUrl(product.productHeadImgFileId,imageSize));
                    }
            } else {
                if(product.productHeadImgFileId){
                    images.unshift(FileService.getRelatedUrl(product.productHeadImgFileId,imageSize));
                }
                images.push(tmpImg);
            }
            obj.productGroup[obj.productIds[b]].imageGroup = images;
        }
        var jsProduct =  ProductService.getProduct(obj.productIds[b]);
        product.price = CommonUtil.getSkuPrice(jsProduct,skuId,loginId);
        product.productId = obj.productIds[b];
        product.sellingPoint = obj.productGroup[obj.productIds[b]].productIntroduction;
        var fav = FavoriteGoodsService.getFavoriteCountAndIsUserKeep(obj.productIds[b],loginId);
        product.isKeep = fav.isKeep;
        product.keeps = fav.favoriteCount;
        product.skuId = skuId;
        var likeId = "likes_product_"+obj.productIds[b];
        var likeObj = ProductLikeService.initLikeObj(likeId);
        var status = 0;
        var hot = ProductLikeService.getLikeInfo(loginId,likeObj,status,{}).data;
        product.likes = hot.likesCount;
        product.isLike = hot.status || "0";
        product.preSaleState = false;
        var jRule = PreSaleService.getProductPreSaleRule(obj.productIds[b]);
        if(jRule){
            var now = Date.now();
            var time = jRule.endLongTime - now;
            if(time > 0){
                product.preSaleState = true;
                product.preSalePrice = jRule.totalPrice;
            }
        }
        }
    }
    var array = [];
    for(var g = 0; g < obj.productIds.length; g++){
        if(obj.productIds[g]){
        array.push(obj.productGroup[obj.productIds[g]]);
        }
    }
    obj.productGroup = array;
    ret.data = obj;
    out.print(JSON.stringify(ret));
})();
