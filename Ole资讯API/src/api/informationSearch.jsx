//#import Util.js
//#import login.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx
/**
 * OLE咨询频道: 栏目新闻查询
 */
;(function () {
    try {
        var userId = LoginService.getFrontendUserId() || $.params["userId"];
        var pageNum = $.params["pageNum"] || 1; // 页码
        var limit = $.params["limit"] || 10; // 页面显示数量
        var from = (pageNum - 1) * 10; // 分页序号
        var imageSize = $.params["imageSize"] || ""; // 图片大小
        
        // 构建查询参数
        var searchParams = {
            "columnId": $.params["columnId"] || InformationService.getInfoColumnId(), // 咨询栏目ID, 默认为设置的OLE总栏目ID
            "title":  $.params.title || "", // 咨询标题
            "from": from, // 分页开始位置
            "limit": limit,// 分页数量
            "imageSize": imageSize // 图片大小
        };
        
        $.log("\n\n\n informationSearch searchParams = " + JSON.stringify(searchParams) + "\n\n\n");
        
        // 查询文章列表
        var data = InformationService.searchInformation(searchParams, userId);
        ResponseUtil.success({
            "information": data["list"] || [],
            "total": data["total"]
        })
    } catch (e) {
        ResponseUtil.error(e.message)
    }
})();