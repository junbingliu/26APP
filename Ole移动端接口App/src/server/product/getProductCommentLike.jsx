//#import doT.min.js
//#import Util.js
//#import login.js

//#import $oleMobileApi:services/ProductCommentLikeService.jsx

/**
 * 商品评论点赞
 * 必传参数：commentId,productId,option
 * option：
 * get ：获取点赞情况，用于初始化界面
 * set ：操作点赞，未点赞情况下请求对评论点赞，已点赞情况下请求取消对评论点赞
 * 返回码status：
 * 0：当前用户未点赞或者未登录情况下均为0，显示点赞图标
 * 1：当前用户已点赞，显示点赞后的图标
 */
(function () {
    var userId = $.params["userId"];
    if (!userId) {
        userId = LoginService.getFrontendUserId();
    }
    var commentId = $.params["commentId"] || "";
    var productId = $.params["productId"] || "";
    var option = $.params["option"] || "get";
    var ret = ProductCommentLikeService.getProductCommentLike(userId, productId, commentId, option);
    setResultInfo(ret.code, ret.msg, ret.data);
})();

function setResultInfo(code, msg, data) {
    // 设置返回格式
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}