//#import doT.min.js
//#import Util.js
//#import login.js
//#import $oleMobileApi:services/ProductHotValueService.jsx

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
 */
(function () {
    var userId = $.params["userId"];
    if (!userId) {
        userId = LoginService.getFrontendUserId();
    }

    var productId = $.params["productId"] || "";
    var option = $.params["option"] || "get";
    var ret = ProductHotValueService.getProductHotValue(userId, productId, option);
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