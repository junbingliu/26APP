//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            result.code = "101";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }
        var jRecord = {};
        jRecord.title = $.params["title"];
        var newId = ActivitiesHenService.add(jRecord, loginUserId);
        result.code = "0";
        result.msg = "操作成功";
        result.newId = newId;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

