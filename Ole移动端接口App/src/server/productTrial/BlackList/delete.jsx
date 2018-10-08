//#import login.js
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
(function () {
    try{
        var userId = $.params.userId || "";
        Preconditions.checkArgument(userId, "用户id不能为空！");

        var outReason = $.params.outReason || "";
        Preconditions.checkArgument(outReason, "移出黑名单原因不能为空！");

        var managerId = LoginService.getBackEndLoginUserId();
        Preconditions.checkArgument(managerId, "管理员未登录！");


        var id = BlackListService.delete(userId,managerId,outReason);
        ResponseUtil.success(id);

    }catch(e) {
        ResponseUtil.error(e.message);
    }

})();