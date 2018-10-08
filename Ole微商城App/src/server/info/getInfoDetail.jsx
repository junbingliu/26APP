//#import Util.js
//#import login.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx

/**
 * OLE咨询频道: 获取杂志详细信息
 */
;(function () {
    try {
        var userId = LoginService.getFrontendUserId(); // 获取用户ID
        var commentId = $.params.id || ""; // 咨询ID
        Preconditions.checkArgument(commentId, "杂志ID不能为空");
        var type = $.params.type || "IMG"; // 详情类型 IMG/TEXT
        var imageSize = $.params.imageSize || "750X1034"; //头图图片规格
        var commentDetailInfo = InformationService.getInfoDetails(commentId, userId, type, imageSize);
        if (commentDetailInfo) {
            delete  commentDetailInfo.productInfoList;//关联商品信息
            delete  commentDetailInfo.recommendInfoList;//推荐信息列表
        }
        ResponseUtil.success({
            "infoDetail": commentDetailInfo
        })
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();