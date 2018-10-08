//#import Util.js
//#import doT.min.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var id = $.params['id'];
    var type = $.params['type'];
    if (!id) {
        out.print("参数为空");
        return;
    }
    var jLog = OpenAPIUtil.getApiLog(id);
    if (!jLog) {
        out.print("id错误，取不到对应的日志");
        return;
    }
    var data = null;
    if (type == "request") {
        data = jLog.data.requestData;
    } else {
        data = jLog.data.responseData;
    }
    var isJson = true;
    try {
        isJson = JSON.parse(data);
    } catch (e) {
        isJson = false;
    }
    var str = data;
    str = str.replace(/'/g, '');
    var pageData = {
        data: str,
        isJson: isJson
    };

    var template = $.getProgram(appMd5, "pages/showData.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();