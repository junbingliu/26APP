//#import Util.js
//#import login.js
//#import product.js
//#import pigeon.js
//#import user.js
//#import price.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
//#import $oleMobileApi:services/FavoriteGoodsService.jsx
//#import @server/util/CommonUtil.jsx
;(function () {
    //获取收藏夹商品信息接口
    //返回函数
    //获取会员价
    //ProductService.getMemberPriceByProductId
    //获取实际支付价格
    //ProductService.getRealPayPric
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    };

    try {
        //获取登录用户信息
        var user = LoginService.getFrontendUser();
        var userId;
        if (!user) {
            userId = $.params.userId;
        } else {
            userId = user.id;
        }

        if (!userId) {
            setResultInfo("E1B0001", "请先登陆");
            return;
        }
        var userGroups = UserService.getUserGroups(userId);
        if (!userGroups) {
            setResultInfo("E1B0001", "获取用户分组失败");
            return;
        }
        var skuId = $.params.skuId;
        /**
         if(!skuId){
            setResultInfo("E1B0001","sku信息为空");
            return;
        }
         **/
        var objId = $.params.objId;
        objId = objId.split(",");
        var objType = $.params.favorType || FavoriteProductTypeService.initDefaultFavoriteType(userId);//收藏夹ID
        var product = {};
        var objList = [];
        $.log("=====favoriteGoodsAdd====");
        if (objId != [] && objType) {
            //var productData = FavoriteProductTypeService.getProductById(objType, objId);
            $.log("=====objId.length====" + objId.length);
            var favoriteTypeList = FavoriteProductTypeService.getListByUserId(userId, 0, -1);

            for (var g = 0; g < objId.length; g++) {
                var isCanAdd = true;
                for (var i = 0; i < favoriteTypeList.length; i++) {
                    var favoriteObj = favoriteTypeList[i];
                    if (favoriteObj) {
                        var favoriteTypeId = favoriteObj.id;
                        var productObj = FavoriteProductTypeService.getProductById(favoriteTypeId, objId[g]);
                        product = ProductService.getProduct(objId[g]);
                        if (productObj != null) {
                            isCanAdd = false;
                            continue;
                        } else if (!product) {
                            isCanAdd = false;
                            continue
                        }
                    }
                }
                if (isCanAdd) {
                    $.log("=====objId[g]====" + objId[g]);
                    FavoriteGoodsService.addFavoriteCount(objId[g]);
                    objList.push(objId[g]);
                }
            }
            var saveCount = 0;
            $.log("=====objList.length====" + objList.length);

            $.log("=====开始查询价格====");

            for (var t = 0; t < objList.length; t++) {
                if (objList[t] != null && objList[t] != '') {
                    product = ProductService.getProduct(objList[t]);
                    var skuId = ProductService.getHeadSku(objList[t]).id;
                    $.log("=====skuId====" + skuId);
                    var skuPrice = CommonUtil.getSkuPrice(product, skuId, userId);
                    $.log("=====skuPrice====" + skuPrice);
                    var realPrice = 0;
                    if (skuPrice != null) {
                        realPrice = skuPrice.curPrice.unitPrice;
                    }
                    $.log("=====realPrice====" + realPrice);
                    //var realPrice = ProductService.getRealPayPrice(product, userId, userGroups);//获取实际价格
                    FavoriteProductTypeService.addFavoriteProduct(objType, objList[t], realPrice + "", skuId);
                    saveCount = realPrice;
                }

            }

            setResultInfo("S0A00000", "success", {"saveCount": saveCount});
        } else {
            setResultInfo("E1B0001", "没有保存对象");
        }

    } catch (e) {

        setResultInfo("E1B0001", "加入收藏夹失败" + e);
        return;
    }
})();