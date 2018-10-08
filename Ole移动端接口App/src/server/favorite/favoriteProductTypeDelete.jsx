//#import Util.js
//#import favorite.js
//#import login.js
//#import pigeon.js
//#import user.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
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
        if (!user) {
            setResultInfo("E1B0001","请先登陆");
            return;
        }
        var userId = user.id;

        var id = $.params.favorType ;
        var favorProductList = FavoriteProductTypeService.getProductList(id,0,-1);
        if(!favorProductList || favorProductList.length > 0){
            setResultInfo("E1B0001","收藏夹下还有商品，不能删除");
            return;
        }
        FavoriteProductTypeService.deleteFavoriteType(id,userId);
        setResultInfo("S0A00000","success");
    } catch (e) {

        setResultInfo("E1B0001","删除收藏夹"+e);
        return;
    }
})();