//#import Util.js
//#import column.js
//#import merchantRights.js

var m = $.params.m;
var id = $.params.id;
var fromId = $.params.fromId;

var columns = ColumnService.getColumnPath(id,fromId,true);
var itemPath = columns.map(function(c){
    return {"id":c.id,"name":c.name}
});

var childrenColumns = ColumnService.getChildren(id);
var itemChildren = childrenColumns.map(function(col){
    return {
        id:col.id,
        name:col.name
    }
});
$.log("itemPath.length=" + itemPath.length + "\n");
var result = {
    state:"ok",
    "itemPath":itemPath,
    itemChildren:itemChildren
}
out.print(JSON.stringify(result));

