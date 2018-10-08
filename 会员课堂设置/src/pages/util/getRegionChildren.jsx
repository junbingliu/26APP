//#import Util.js
//#import column.js

(function () {
    var ret = {};
    try {
        var parentId = $.params.parentId;
        if (!parentId) {
            ret = {code: "101", msg: "参数错误"};
            out.print(JSON.stringify(ret));
            return;
        }

        var jRoot = ColumnService.getColumn(parentId);
        if (!jRoot) {
            ret = {code: "102", msg: "地区不存在"};
            out.print(JSON.stringify(ret));
            return;
        }

        var recordList = [];
        var children = ColumnService.getChildren(parentId);
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var jChild = children[i];
                jChild.hasChildren = ColumnService.hasChildren(jChild.id);
                recordList.push(jChild);
            }
        }

        ret = {};
        ret.code = "0";
        ret.msg = "";
        ret.children = recordList;
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.log("\n...................e=" + e);
        ret = {code: "99", msg: "操作出现异常，请稍后再试"};
        out.print(JSON.stringify(ret));
    }
})();