//#import Util.js
//#import login.js
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import $oleMobileApi:services/OrderAppraiseService.jsx

/**
 * 添加订单的评价
 * by fuxiao
 * email fuxiao9@crv.com.cn
 */
;(function () {
    
    try {
        var userId = LoginService.getFrontendUserId() || $.params.userId;
        Preconditions.checkArgument(userId, "请登陆");
        
        var orderId = $.params.orderId;
        Preconditions.checkArgument(orderId, "订单ID不能为空");
    
        var comment = $.params.comment;
        Preconditions.checkArgument(comment, "评论信息不能为空");
        
        var satisfaction = $.params.satisfaction; // 满意度: 0: 不满意, 1: 基本满意, 2: 非常满意
        Preconditions.checkArgument(satisfaction, "订单满意度不能为空");
        
        // 添加订单评论
        var id = OrderAppraiseService.addOrderAppraise({
            "userId": userId,
            "orderId": orderId,
            "comment": comment,
            "satisfaction": satisfaction
        });
        
        if (!id) {
            ResponseUtil.error();
            return;
        }
        
        ResponseUtil.success({
            id: id
        });
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
