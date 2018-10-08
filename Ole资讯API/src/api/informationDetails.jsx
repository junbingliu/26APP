//#import Util.js
//#import login.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx

/**
 * OLE咨询频道: 获取咨询详细信息
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function () {
    try {
        var userId = LoginService.getFrontendUserId() || $.params["userId"]; // 获取用户ID
        var commentId = $.params.id || ""; // 咨询ID
        Preconditions.checkArgument(commentId, "咨询ID不能为空");
        var type = $.params.type || "TEXT"; // 详情类型
        var commentDetailInfo = InformationService.getInfoDetails(commentId, userId, type);
        ResponseUtil.success({
            "infoDetail": commentDetailInfo
        })
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();