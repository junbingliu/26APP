//#import Util.js
//#import login.js
//#import pigeon.js
//#import user.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
//#import $oleMobileApi:services/FavoriteGoodsService.jsx
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
        var userId;
        var user = LoginService.getFrontendUser();
        if (!user) {
            userId = $.params.userId;
           // setResultInfo("E1B0001","请先登陆");
            //return;
        } else {
            userId = user.id;
        }
            var objId = $.params.objId;
            var objType = $.params.favorType;//收藏夹ID
            if(!objId){
                setResultInfo("E1B0001","商品Id为空");
                return;
            }
            var favoriteTypeList = FavoriteProductTypeService.getListByUserId(userId, 0, -1);
            var isDelete = false;
            for(var i=0; i<favoriteTypeList.length; i++){

                var favoriteObj = favoriteTypeList[i];
                if(favoriteObj){
                    var favoriteTypeId = favoriteObj.id;
                    var productObj = FavoriteProductTypeService.getProductById(favoriteTypeId, objId);
                    if(productObj != null){
                        FavoriteProductTypeService.deleteFavoriteProduct(favoriteTypeId,objId);
                        FavoriteGoodsService.removeFavoriteCount(objId);
                        isDelete = true;
                        break;
                    }
                }
            }




        if(isDelete){
            setResultInfo("S0A00000","success");
        }else {
            setResultInfo("E1B0001","该商品没有收藏");
        }

    } catch (e) {

        setResultInfo("E1B0001","删除失败"+e);
        return;
    }
})();