//#import doT.min.js
//#import Util.js
//#import product.js
//#import login.js
//#import search.js
//#import merchant.js
//#import file.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        var m = $.params.m;
        var id = $.params.id;
        var record = PushManagementService.getNew(id);
        var pageData = {
            // state: "ok",
            record: record,
            merchantId: m,
            id: id
        };
        var template = $.getProgram(appMd5, "pages/PushManagement/pushManagementEdit.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e)
    }
})();






