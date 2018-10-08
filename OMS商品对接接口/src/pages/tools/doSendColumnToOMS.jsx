//#import Util.js
//#import jobs.js

(function () {

    var result = {};
    try {
        var columnId = $.params["columnId"];
        var actionType = $.params["actionType"];
        if (!columnId || columnId == "") {
            result.code = "101";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        if (!(actionType == "columnAdd" ||
            actionType == "columnUpdate" ||
            actionType == "columnDelete")) {
            result.code = "102";
            result.msg = "actionType参数不合法";
            out.print(JSON.stringify(result));
            return;
        }
        if(actionType == "columnAdd"){
            actionType = "Create";
        }else if(actionType == "columnUpdate"){
            actionType = "Modify";
        }else {
            actionType = "Delete";
        }

        var jobPageId = "task/doUpdateColumnToOMS.jsx";
        var when = (new Date()).getTime();
        var postData = {
            columnId: columnId,
            action: actionType
        };
        JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);

        result.code = "0";
        result.msg = "对接成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "99";
        result.msg = "对接出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    }

})();
