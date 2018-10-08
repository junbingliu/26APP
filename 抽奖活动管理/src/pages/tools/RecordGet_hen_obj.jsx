//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx
//#import doT.min.js

(function () {

    var result = {};
    try {

        result =ActivitiesHenService.getAllList(0,-1);
        result.code = "0";
        result.msg = "操作成功";
        /*记得要注释*/
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

