//#import Util.js
//#import login.js
//#import user.js
//#import order.js
//#import $freeGetCardSetting:services/FreeGetCardSettingService.jsx


;(function () {
    var result = {};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "101";
            result.msg = "请先登录";
            return;
        }

        var merchantId=$.params.merchantId;
        var createUserId=userId;

        var jGetCardRecord = {};
        jGetCardRecord.name = $.params.title;
        jGetCardRecord.duration = $.params.duration;
        jGetCardRecord.money = $.params.money;
        jGetCardRecord.comment = $.params.comment;
        jGetCardRecord.coupon = $.params.coupon;
        jGetCardRecord.activityId = $.params.activityId;
        jGetCardRecord.cardBatchId = $.params.cardBatchId;

        var newId = FreeGetCardSettingService.addGetCardRecord(jGetCardRecord, createUserId, merchantId);

        result.code = "0";
        result.msg = "保存成功";
        result.newId = newId;
    }
    catch (e) {
        result.code = "99";
        result.msg = "操作出现异常：" + e;
    } finally {
        var data = JSON.stringify(result);
        out.print(data);
    }
})();