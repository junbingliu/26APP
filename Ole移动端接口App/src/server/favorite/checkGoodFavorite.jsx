//#import Util.js
//#import login.js
//#import product.js
//#import pigeon.js
//#import user.js
//#import inventory.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
;(function () {
    //商品是否被收藏
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }


    try {
        //var products = $.params.products;
        //var spec = $.params.spec || "200X200";

        var userId = LoginService.getFrontendUserId();  //这是顾客的id

        if (!userId) {
            setResultInfo("E1B0001","请先登陆");
            return;
        }
        var productId = $.params.productId;//商品Id
        if (!productId) {
            setResultInfo("E1B0001","请传入商品Id");
            return;
        }
        var favoriteTypeList = FavoriteProductTypeService.getListByUserId(userId, 0, -1);
        var isKeep = false;
        for(var i=0; i<favoriteTypeList.length; i++){

            var favoriteObj = favoriteTypeList[i];
            if(favoriteObj){
                var favoriteTypeId = favoriteObj.id;
                var productObj = FavoriteProductTypeService.getProductById(favoriteTypeId, productId);
                if(productObj != null){
                    isKeep = true;
                    break;
                }
            }
        }
        setResultInfo("S0A00000","success",{
            "isKeep":isKeep
        });
    } catch (e) {
        $.error("获取购物车商品列表失败" + e);
        setResultInfo("E1B0001333","商品收藏状态获取失败" + e);
    }
})();