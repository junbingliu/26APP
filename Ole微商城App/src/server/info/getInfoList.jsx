//#import Util.js
//#import login.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx
/**
 * OLE杂志搜索与列表
 */
;(function () {
    try {
        var userId = LoginService.getFrontendUserId() || $.params["userId"];
        var pageNum = $.params["pageNum"] || 1; // 页码
        var limit = $.params["limit"] || 10; // 页面显示数量
        var from = (pageNum - 1) * 10; // 分页序号
        var imageSize = $.params["imageSize"] || ""; // 图片大小
        var columnId = $.params["columnId"];
        if (!columnId) {
            var config = ps20.getContent('appConfig_ole');
            config = JSON.parse(config + "");
            columnId = config.data && config.data.information && config.data.information.magazine;//杂志栏目的id
        }

        // 构建查询参数
        var searchParams = {
            "channel":"h5",
            "columnId": columnId || InformationService.getInfoColumnId(), // 杂志栏目ID, 默认为设置的OLE总栏目ID
            "title": $.params.title || "", // 杂志标题
            "from": from, // 分页开始位置
            "limit": limit,// 分页数量
            "imageSize": imageSize // 图片大小
        };

        // 查询杂志列表
        var data = InformationService.searchInformation(searchParams, userId);
        ResponseUtil.success({
            "information": data["list"] || [],
            "total": data["total"]
        })
    } catch (e) {
        ResponseUtil.error(e.message)
    }
})();