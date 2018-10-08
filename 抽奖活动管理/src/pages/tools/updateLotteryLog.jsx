//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/LotteryLogService.jsx

(function () {

    var result = {};
    try {
        var lotteryId = $.params["lotteryId"];
        var status = $.params["status"];
        var jRecord = LotteryLogService.get(lotteryId);

        if(!jRecord){
            //todo:
            return;
        }

        jRecord.status = status;
        LotteryLogService.update(jRecord);
        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

