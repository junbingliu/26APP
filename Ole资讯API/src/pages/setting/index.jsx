//#import Util.js
//#import doT.min.js
//#import $OleInformationAPI:services/InformationService.jsx
;(function () {
    var title = $.params['title'] || "0";
    if (title === "0") {
        var template = $.getProgram(appMd5, "pages/setting/informationSetting.jsxp");
        var infoColumnId = InformationService.getInformationSetting() || {};
        var pageData = {data: infoColumnId};
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    }
})();