//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import doT.min.js
//#import column.js


(function () {
    var result = {};
    try {
        var id = $.params["parentId"];
        if (id==null||id=="") {
            var  id = "c_region_1602";
        }
        result=ColumnService.getChildren(id);
        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

