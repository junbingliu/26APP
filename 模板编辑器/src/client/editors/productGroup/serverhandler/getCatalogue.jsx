//#import Util.js
//#import column.js

var columnId = $.params.columnId;
(function(){
    var defaultColumn ={id:"c_10000",name:"所有商品",open:true}
    var columnChildren=ColumnService.getChildren(columnId);
    columnChildren=getChildren(columnChildren);
    defaultColumn.children=columnChildren;
    out.print(JSON.stringify(defaultColumn))
})();

function getChildren(columnData){
    for(var i in columnData){
        var columnId=columnData[i].id;
        var hasChildren=ColumnService.hasChildren(columnId);
        if(hasChildren){
            var data=ColumnService.getChildren(columnId);
            columnData[i].children=data;
            getChildren(data);
        }
    }
    return columnData;
}