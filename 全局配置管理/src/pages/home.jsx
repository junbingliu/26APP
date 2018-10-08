(function () {
//#import doT.min.js
//#import pigeon.js
//#import Util.js

    var merchantId = $.params["m"];
    response.sendRedirect("globalVariableList.jsx?m="+merchantId);

    //var template = $.getProgram(appMd5, "pages/home.jsxp");
    //var pageData = {};
    //var pageFn = doT.template(template);
    //out.print(pageFn(pageData));
})();

