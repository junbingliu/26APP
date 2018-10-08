//#import Util.js
//#import $getui:services/GetuiService.jsx
//#import doT.min.js

(function () {
    var id = $.params.id;
    var type = $.params.type || "request";
    if (!id) {
        out.print("参数为空");
        return;
    }
    var record = GetuiService.getLog(id);
    var data = {};
    if (type == "request") {
        data = record.requestData;
    } else {
        data = record.responseData;
    }
    if (!data) {
        data = {};
    }
    var str = JSON.stringify(data);
    str = str.replace(/'/g,'');
    var pageData = {
        data: str
    };

    var template = $.getProgram(appMd5, "pages/showData.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();