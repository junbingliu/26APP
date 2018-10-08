//#import Util.js
//#import Info.js
//#import login.js

(function () {
    try {
        var result = {};
        var ids = $.params["ids"];
        var pubState = $.params["pubState"];
        var type = $.params["type"];
        //获取登录Id
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "0";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        if (type == "del") {
            var array = ids.split(",");
            var delIds = [];
            for (var i = 0; i < array.length; i++) {
                var id = array[i];
                var jInfo = InfoService.getInfo(id);
                var infoPublishState = jInfo.noversion && jInfo.noversion.publishLog && jInfo.noversion.publishLog.publishState || "0";
                if (infoPublishState == "1") {
                    continue;
                }
                delIds.push(id);
            }
            if (delIds.length == 0) {
                result.code = "0";
                result.msg = "已上架的信息不能删除,请下架后再删除";
                out.print(JSON.stringify(result));
                return;
            }
            InfoService.deleteInfo(delIds.join(","), userId);
            result.msg = "删除成功";
        }
        else {
            InfoService.updatePublishState(ids, pubState, userId);
            result.msg = "上下架状态修改成功";
        }
        result.code = "ok";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        $.log("......................error=" + e);
        result.code = "0";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }


})();

