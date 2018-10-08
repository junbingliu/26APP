//#import Util.js
//#import login.js
//#import DateUtil.js
//#import $lotteryEventManage:services/VerificationCodeService.jsx
//#import $lotteryEventManage:services/LotteryLogService.jsx
//#import $lotteryEventManage:services/LotteryEventManageService.jsx

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
        var number= $.params["number"];
        var eventId= $.params["id"];
        var jActivity = LotteryEventManageService.get(eventId);





        for(var i=0;i<number;i++){
            var vfCode =  LotteryLogService.getRandomCode(16);
            jRecord.vfCode = vfCode;
            jRecord.state ="1";
            jRecord.eventName=jActivity.eventName;
            jRecord.eventId=jActivity.id;
            jRecord.operator=loginUserId;
            var newId =VerificationCodeService.add(jRecord,loginUserId);
        }

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

