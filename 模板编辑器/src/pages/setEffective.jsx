//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js

(function () {
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if (!m) {
        m = "m_100";
    }
    try {
        var result = AppEditorService.addToEffectiveTemplates(m, rappId);
        var template = $.getProgram(appMd5, 'pages/setEffective.jsxp');
        var pageData = {msg: "成功设为有效模版。", state: true, m: m};
        if (result && result.state != "ok") {
            var existsPage = result.existsPage;
            var currentPage = result.currentPage;
            var currentApp = AppService.getApp(existsPage.appId);
            var msg = "当前APP中的URL:【" + currentPage.url + "】与现有APP【" + (currentApp && currentApp.name || existsPage.appId) + "】的页面" +
                "【" + existsPage.name + "】 URL【" + existsPage.url + "】重复，请修改后再生效!";
            pageData = {msg: "生效模板出错，错误信息：" + msg, state: false, m: m};
            var editorUrl = "/appEditor/pages/listPages.jsx?m=" + m + "&rappId=" + rappId;
            pageData.msg += "<br><a href='" + editorUrl + "'>点击修改</a>"
        }
        var fn = doT.template(template);
        var html = fn(pageData);
        out.print(html);
    } catch (e) {
        var template = $.getProgram(appMd5, 'pages/setEffective.jsxp');
        var pageData = {msg: "设为有效模版失败。", state: false, m: m};
        var fn = doT.template(template);
        var html = fn(pageData);
        out.print(html);
    }
})();