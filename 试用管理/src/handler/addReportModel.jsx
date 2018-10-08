//#import Util.js
//#import login.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/reportModelQuery.jsx

/**
 * 添加一个商品类别的商品报告的填写提示语，根据商品所属的父类别
 */
(function () {
    var columnIds = $.params["columnIds"] || "";
    var id = $.params["id"] || "";
    if (!columnIds) {
        out.print(JSON.stringify({status: "no", msg: "分类ID不能为空"}));
        return;
    }

    //此对象是用来记录所有添加的columnId
    var columnObj = tryOutManageServices.getById("tryOutManage_model_columnIds");
    if (!columnObj) {
        columnObj = {
            id: "tryOutManage_model_columnIds",
            columnObj: {}
        }
    }
    if (!columnObj.columnObj) {
        columnObj.columnObj = {};
    }
    columnIds = columnIds.split(",");
    if (id) {
        var yuanModel = tryOutManageServices.getById(id);
        var yuancolumnIds = yuanModel.columnIds.split(",");
        //首先把原来保存的columnId删除，避免修改的时候产生重复，或者没必要的问题
        for (var a = 0; a < yuancolumnIds.length; a++) {
            if (yuancolumnIds[a]) {
                delete columnObj.columnObj[yuancolumnIds[a]];
            }
        }
    }
    var columnId = "";
    for (var t = 0; t < columnIds.length; t++) {
        if (!columnIds[t]) {
            continue;
        }
        columnIds[t] = columnIds[t].trim();
        var col = ColumnService.getColumn(columnIds[t]);
        //如果这个columnId还存在子元素，那么就跳过，不然列一个分支如果不是同一个属性就惨了，比如说一个是吃的，一个是用的
        if (col && col.hasChildren) {
            continue
        }
        //如果在别的已经存在就跳过，避免重复添加
        if (columnObj.columnObj[columnIds[t]]) {
            continue;
        } else {
            //
            if (columnId != ",") {
                columnObj.columnObj[columnIds[t]] = columnIds[t];
                columnId = columnIds[t];
            } else {
                columnId = columnId + "," + columnIds[t];
            }
        }
    }
    tryOutManageServices.addObj("tryOutManage_model_columnIds", columnObj);
    var data = {
        id: id,
        columnIds: columnId,
        statement1: $.params["statement1"] || "",
        statement2: $.params["statement2"] || "",
        statement3: $.params["statement3"] || "",
        statement4: $.params["statement4"] || "",
        statement5: $.params["statement5"] || ""
    };

    var isC = columnId.replace(",", "");
    //有时候剔除重复以后就剩个逗号，那就直接跳过
    if (!isC) {
        out.print(JSON.stringify({status: "no"}));
        return;
    }
    tryOutManageServices.addModel(data);

    out.print(JSON.stringify({status: "ok"}));
})();