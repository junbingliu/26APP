//#import doT.min.js
//#import Util.js
//#import $oleMemberClass:services/OleMemberClassService.jsx
(function () {
    var merchantId = $.params["m"];
    var classId = $.params["classId"];
    var classObj=null;
    if (classId) {
        classObj = OleMemberClassService.getClass(classId);
    }
    var pageData = {
        merchantId: merchantId,
        classObj: classObj
    };

    var template = $.getProgram(appMd5, "pages/activity/classDetail.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

