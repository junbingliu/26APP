//#import Util.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 获取全部活动名称，用于导出的筛选列表
 */
(function () {
    var objList = tryOutManageServices.getLists(0,-1);
    var list = [];
    for(var i = 0;i < objList.length; i++){
        var obj = {};
        if(objList[i]){
            obj.id = objList[i].id;
            obj.title = objList[i].title;
            list.push(obj);
        }
    }
    out.print(JSON.stringify(list));
})();