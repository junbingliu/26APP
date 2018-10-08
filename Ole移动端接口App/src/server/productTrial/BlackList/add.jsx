//#import login.js
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/BlackListReason.jsx
(function () {
    try {
        var userId = $.params.userId || "";
        Preconditions.checkArgument(userId, "用户id不能为空！");

        var managerId = $.params.managerId || "";
        if (!managerId) {
            var managerId = LoginService.getBackEndLoginUserId();
        }
        Preconditions.checkArgument(managerId, "管理员未登录！");

        var activityId = $.params.activityId || "";
        Preconditions.checkArgument(activityId, "活动id不能为空！");

        var productId = $.params.productId || "";
        Preconditions.checkArgument(productId, "商品id不能为空！");

        var orderId = $.params.orderId || "";

        var reasonCode = $.params.reasonCode || "";
        Preconditions.checkArgument(reasonCode, "加入黑名单原因码不能为空！");
        if (!(reasonCode in BlackListReason)) {
            throw  new Error("该原因码不存在！");
        }
        var inReason = BlackListReason[reasonCode];

        var id = BlackListService.add(userId, managerId, activityId, productId, orderId, inReason);
        ResponseUtil.success(id);

    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();