//#import Util.js
//#import Info.js
//#import column.js

(function () {
    try {
        var result = {};
        result.code = 0;
        var pos = $.params["pos"];
        var objId = $.params["objId"];

        //获取info对象
        var InfoObj = InfoService.getInfo(objId);
        if (!InfoObj) {
            result.code = "0";
            result.msg = "infoId有误";
            out.print(JSON.stringify(result));
        }
        //获取columnId
        var columnId = InfoObj.columnId;
        if (!columnId) {
            result.code = "0";
            result.msg = "columnId为空";
            out.print(JSON.stringify(result));
        }
        //获取merchantId
        var merchantId = InfoObj.merchantId;
        if (!merchantId) {
            result.code = "0";
            result.msg = "商家Id为空";
            out.print(JSON.stringify(result));
        }
        //获取父类columnId
        var parentId = ColumnService.getColumn(columnId).parentId || columnId;
        if (!parentId) {
            result.code = "0";
            result.msg = "父类columnId为空";
            out.print(JSON.stringify(result));
        }

        //修改优先级
        InfoService.updatePos(objId, pos, parentId, merchantId);

        result.code = "ok";
        result.msg = "优先级修改成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        $.log("......................error=" + e);
        result.code = "0";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }


})();

