//#import Util.js
//#import pageService.js
;(function () {
    var m = $.params.m || $.getDefaultMerchantId(); // 商家ID, 默认平台总ID
    var appId = $.params.appId || "oleSearchHotWord"; // AppID, 对应 meta.json中的context配置
    var pageId = $.params.pageId || "searchHotWord"; // pageID, 对应 meta.json 中的 pages 中的 pageId 配置
    var pageData = pageService.getMerchantPageData(m, appId, pageId);
    var hotData = pageData.hotkey || {};
    var array = hotData.map(function(info) {
        $.log("\n\n" + JSON.stringify(info) + "\n\n");
        return info.content
    });
    setResultInfo("S0A00000", "success", {
        "hotWord": array
    })

})();

// 返回函数
function setResultInfo(code, msg, data) {

    // 设置返回格式
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}

