//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import jobs.js

;
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

        var userId = $.params["userId"];
        var beginDate = $.params["beginDate"];
        var beginTime = $.params["beginTime"];
        var endDate = $.params["endDate"];
        var endTime = $.params["endTime"];

        var jUser = UserService.getUser(userId);
        if (!jUser) {
            result.code = "102";
            result.msg = "用户不存在";
            out.print(JSON.stringify(result));
            return;
        }

        if (!beginDate || beginDate == "" || !beginTime || beginTime == "" || !endDate || endDate == "" || !endTime || endTime == "") {
            result.code = "103";
            result.msg = "endTime参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        jUser.preDepositRuleBeginTime = DateUtil.getLongTime(beginDate + " " + beginTime);
        jUser.preDepositRuleEndTime = DateUtil.getLongTime(endDate + " " + endTime);

        UserService.updateUser(jUser, loginUserId);

        if(jUser.preDepositRuleEndTime){
            //添加到到期自动清0队列
            var when = jUser.preDepositRuleEndTime;
            var jobPageId = "task/ClearEWalletAmountTask.jsx";
            var postData = {userId: userId};
            JobsService.submitTask(appId, jobPageId, postData, when);
        }

        result.code = "0";
        result.msg = "保存成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
