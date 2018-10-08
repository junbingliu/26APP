//#import Util.js
//#import login.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx

/**
 * OLE咨询频道: 获取咨询详细信息
 */
;(function () {
    try {
        var userId = LoginService.getFrontendUserId() || $.params["userId"];
        Preconditions.checkArgument(userId, "请登陆");
    
        var commentId = $.params.id || ""; // 咨询ID
        Preconditions.checkArgument(commentId, "咨询ID不能为空");
    
        var commentStatues = InformationService.getOtherInfo(commentId, userId);
        ResponseUtil.success({
            "states": commentStatues
        });
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();