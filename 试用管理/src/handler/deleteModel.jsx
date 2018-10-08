//#import Util.js
//#import $tryOutManage:services/tryOutManageServices.jsx

/**
 * 删除公共对象里存的columnId，再删除具体存语句的对象
 */
(function () {
    var id = $.params["id"];
    var yuan = tryOutManageServices.getById(id);
    //因为存的是一个字符串，所以需要转换
    var columnIds = yuan.columnIds.split(",");
    var columnObj = tryOutManageServices.getById("tryOutManage_model_columnIds");
    for(var r = 0; r < columnIds.length; r++){
        if(columnObj.columnObj){//保险起见做一下空判断
            delete columnObj.columnObj[columnIds[r]];
        }
    }
    tryOutManageServices.addObj("tryOutManage_model_columnIds",columnObj);
    var ok = tryOutManageServices.deleteModel(id);
    if(ok){
        out.print(JSON.stringify({status:"ok"}));
    }
})();