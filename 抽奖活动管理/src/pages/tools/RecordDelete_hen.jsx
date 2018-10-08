//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {

    var result = {};
    var  name = $.params["id"];

    try {
        ActivitiesHenService.del(name);
        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

