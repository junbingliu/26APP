//#import Util.js
//#import appraise.js
//#import login.js
//#import order.js
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx

/**
 * 添加商品评论
 * by fuxiao
 * email fuxiao9@crv.com.cn
 */
;(function () {
    
    try {
        var userId = LoginService.getFrontendUserId() || $.params.userId;
        Preconditions.checkArgument(userId, "请登陆");
        
        var orderId = $.params.orderId; // 订单ID不能为空
        Preconditions.checkArgument(orderId, "订单ID不能为空");
        
        var orderInfo = OrderService.getOrderByKey(orderId);
        Preconditions.checkArgument(orderInfo, "订单不存在");
        
        var productId = $.params.productId;
        Preconditions.checkArgument(productId, "商品ID不能为空");
        
        var skuId = $.params.skuId;
        Preconditions.checkArgument(skuId, "SKU_ID不能为空");
        
        var comment = $.params.comment;
        Preconditions.checkArgument(comment, "评论信息不能为空");
        
        var star = $.params.star || 5; // 星级
        
        var appraise = {"star": star, "comment": comment}; // 构建评论对象
        
        // 判断添加评论是否存在图片
        var images = $.params.images; // 评论上传的图片, 多张图片已|分隔
        if (images) {
            appraise.images = images.split("|");
        }
        $.log("");
        // 添加评论
        var result = AppraiseService.addProductAppraiseByOrderId(orderInfo.id, userId, productId, skuId, appraise);
        if (!result || result.state !== "0") {
            ResponseUtil.error(result.msg);
            return
        }
        ResponseUtil.success();
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
