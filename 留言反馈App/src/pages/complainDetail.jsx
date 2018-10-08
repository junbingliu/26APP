//#import doT.min.js
//#import Util.js
//#import $oleComplaintApp:services/OleComplainService.jsx
(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    $.log("=============m======"+merchantId);
    $.log("=============id======"+id);
    var jComplaint = {};
    if (id) {
        jComplaint = OleComplainService.getComplaint(id);
    }
    var pageData = {
        merchantId: merchantId,
        jComplaint:jComplaint
    };
    var template = $.getProgram(appMd5, "pages/complainDetail.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();