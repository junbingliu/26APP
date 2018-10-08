//#import Util.js
//#import column.js

var columnId = $.params.columnId;
(function(){
    var defaultColumn ={id:"c_brand_00001",name:"品牌自定义分类",open:true}
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