//#import Util.js
//#import login.js
//#import product.js
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
        var userGroups = UserService.getUserGroups(userId);
        if(!userGroups){
            setResultInfo("E1B0001","获取用户分组失败");
            return;
        }
        var objId = $.params.objId;
        var oldObjType = $.params.oldFavorType;//收藏夹ID
        var newFavorType = $.params.newFavorType;//收藏夹ID
        if(!objId){
            setResultInfo("E1B0001","商品Id为空");
            return;
        }
        if(!oldObjType){
            setResultInfo("E1B0001","商品原来所属收藏夹为空");
            return;
        }
        if(!newFavorType){
            setResultInfo("E1B0001","目标收藏夹为空");
            return;
        }
        var product = FavoriteProductTypeService.getProductById(oldObjType, objId);
        if (product == null){
            setResultInfo("E1B0001","没有找到该收藏商品");
        }
        FavoriteProductTypeService.deleteFavoriteProduct(oldObjType,objId);
        FavoriteProductTypeService.addFavoriteProduct(newFavorType, objId, product.price+"");

        setResultInfo("S0A00000","success");
    } catch (e) {

        setResultInfo("E1B0001","加入收藏夹失败"+e);
        return;
    }
})();