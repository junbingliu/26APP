//#import @server/util/ErrorCode.jsx
//#import $oleMobileApi:services/ProductLikeUtilService.jsx
//#import Util.js
/**
 * 商品热度点赞
 * 必传参数：productId,option
 * option：
 * get ：获取点赞情况，用于初始化界面
 * set ：操作点赞，未点赞情况下请求对评论点赞，已点赞情况下请求取消对评论点赞
 * getUsers : 获取对某个项目点赞的用户数
 * getObjs : 获取某个用户对那些项目进行了点赞
 * 返回码status：
 * 0：当前用户未点赞或者未登录情况下均为0，显示点赞图标
 * 1：当前用户已点赞，显示点赞后的图标
 * Objs:
 * likeObj : 存储了商品的点赞数和点赞用户列表
 * userLikeObj：存储了用户的点赞数和点赞商品列表
 */
var ProductHotValueService = (function () {
    var prefix = "likes_product_"; //前缀
    var f = {};

    f.getProductHotValue = function (arguserId, argProductId, argOption) {
        var ret = ErrorCode.S0A00000;

        var userId = arguserId || "";
        var productId = argProductId || "";
        var option = argOption || "get";//get为获取点赞情况，edit为执行点赞或取消点赞操作
        var likeId = prefix + productId;//点赞对象Id
        var userLikeId = prefix + userId;
        var status = 0;//1表示用户已点赞 0表示用户未点赞

        if (option === "get"|| option ==="set"){

            var product = ProductLikeService.checkProduct(productId);
            if (!product) {
                ret = ErrorCode.product.E1M00011;//没有此商品
                return ret;
            }
        }


        var likeObj = ProductLikeService.initLikeObj(likeId);//点赞对象
        var userLikeObj = ProductLikeService.initLikeObj(userLikeId);//点赞对象

        return ProductLikeService.optionSwich(userId,productId,likeObj,likeId,userLikeId,userLikeObj,status, option, ret);

    };

    return f;
})();