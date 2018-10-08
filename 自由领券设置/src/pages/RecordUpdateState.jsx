//#import Util.js
//#import login.js
//#import user.js
//#import $freeGetCardSetting:services/FreeGetCardSettingService.jsx

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

        var id = $.params["id"];

        if (!id || id == "") {
            result.code = "103";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }


        var jGetCardRecord = FreeGetCardSettingService.getGetCardRecord(id);
        if(!jGetCardRecord){
            result.code = "105";
            result.msg = "数据不存在";
            out.print(JSON.stringify(result));
            return;
        }

        jGetCardRecord.name = $.params.title;
        jGetCardRecord.duration = $.params.duration;
        jGetCardRecord.money = $.params.money;
        jGetCardRecord.comment = $.params.comment;
        jGetCardRecord.coupon = $.params.coupon;
        jGetCardRecord.activityId = $.params.activityId;
        jGetCardRecord.cardBatchId = $.params.cardBatchId;

        FreeGetCardSettingService.updateGetCardRecord(jGetCardRecord);

        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
