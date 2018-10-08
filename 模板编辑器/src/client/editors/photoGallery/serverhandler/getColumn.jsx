//#import Util.js
//#import file.js

var merchantId = $.params.m;
(function(){
    var defaultFileColumn =FileService.getDefaultFileColumn(merchantId);
    defaultFileColumn.name="我的文件";
    defaultFileColumn.open="true";
    var columnChildren=FileService.getAllColumnChildren(defaultFileColumn.id);
    columnChildren=getChildren(columnChildren);
    defaultFileColumn.children=columnChildren;
    out.print(JSON.stringify(defaultFileColumn))
})();

function getChildren(columnData){
    for(var i in columnData){
        var columnId=columnData[i].id;
        var hasChildren=FileService.hasChildren(columnId);
        if(hasChildren){
            var data=FileService.getAllColumnChildren(columnId);
            columnData[i].children=data;
            getChildren(data);
        }
    }
    return columnData;
}
