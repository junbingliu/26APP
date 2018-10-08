//#import Util.js
//#import column.js

var regionId = $.params.regionId;
var action = $.params.action;
try{
    if(action=="getRegion"){
        var column = ColumnService.getColumn(regionId);
        var region = {
            id:column.id,
            name:column.name
        }
        var ret = {
            state:"ok",
            region:region
        };
        out.print(JSON.stringify(ret));
    }
    if(action=='getSubRegions'){
        var children = ColumnService.getChildren(regionId);
        var ret = {
            state:'ok'
        }
        if(children){
            ret.children = children.map(function(column){
                return {id:column.id,name:column.name};
            });
            out.print(JSON.stringify(ret));
        }
    }
    if(action=='getRootRegion'){
        var region = {
            id:'col_region',
            name:'主地区'
        }
        var ret = {
            state:"ok",
            region:region
        };
        out.print(JSON.stringify(ret));
    }
    if(action=='getFullPathObjects'){
        var columns = ColumnService.getColumnPath(regionId,'col_region',true);
        var regions = [];
        if(columns){
            for(var i=0; i<columns.length; i++){
                var column = columns[i];
                if(column.id!='col_region'){
                    var region = {
                        id:column.id,
                        name:column.name
                    }
                    regions.push(region);
                }
            }

        }
        var ret = {
            state:"ok",
            regions:regions
        };
        out.print(JSON.stringify(ret));
    }
    if(action=='getFullPathString'){
        var fullPathString = ColumnService.getColumnNamePath(regionId,'c_region_1602',"");
        var ret = {
            state:"ok",
            regions:fullPathString
        };
        out.print(JSON.stringify(ret));
    }
}
catch(e){
    var ret = {state:err,msg:e};
    out.print(JSON.stringify(ret));
    $.log("...............get region error:"+JSON.stringify(ret));
}
