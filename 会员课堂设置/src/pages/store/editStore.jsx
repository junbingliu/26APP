//#import doT.min.js
//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/StoreService.jsx

(function () {
    try {

        var pageData = StoreService.getStore($.params.id);
        // var template = $.getProgram(appMd5, "pages/editStore.jsxp");
        // var pageFn = doT.template(template);
        out.print(JSON.stringify(pageData));
    } catch (e) {
        out.print(e)
    }
})();






