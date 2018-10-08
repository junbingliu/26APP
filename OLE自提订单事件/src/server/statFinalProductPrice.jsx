//#import Util.js
//#import login.js
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffArgService.jsx
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffLogService.jsx

;
(function () {
    var result = {};
    try {
        var userId = $.params["userId"];
        var totalProductPrice = $.params["price"];

        if (!userId) {
            result.code = "102";
            result.msg = "userId参数错误";
            out.print(JSON.stringify(result));
            return;
        }
        if (!totalProductPrice) {
            result.code = "103";
            result.msg = "price参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        var jArgs = DirectFirstOrderHalfOffArgService.getArgs();
        var checkResult = DirectFirstOrderHalfOffArgService.checkMerchantId(jArgs, merchantId);
        if (checkResult.code != "0") {
            result.code = "104";
            result.msg = "当前商家不参加活动";
            out.print(JSON.stringify(result));
            return;
        }

        var activityId = DirectFirstOrderHalfOffArgService.getValueByKey(jArgs, "activityId");
        if (!activityId || activityId == "") {
            result.code = "300";
            result.price = totalProductPrice;
            result.msg = "activityId未配置，使用原价返回";
            out.print(JSON.stringify(result));
            return;
        }

        var jUserLog = DirectFirstOrderHalfOffLogService.getUserLog(activityId, userId);
        if (jUserLog) {
            result.code = "300";
            result.price = totalProductPrice;
            result.msg = "该用户已享受过五折优惠，使用原价返回";
            out.print(JSON.stringify(result));
            return;
        }

        var totalHalfOffPrice = (Number(totalProductPrice) / 2).toFixed(2);//五折后的优惠金额

        var finalProductPrice;
        if (totalHalfOffPrice > 80) {
            //如果五折后优惠金额大于80，则最多优惠80
            finalProductPrice = Number(totalProductPrice) - 80;
        } else {
            //小于80，则可以全部五折
            finalProductPrice = totalHalfOffPrice;
        }

        result.code = "200";
        result.price = finalProductPrice;
        result.msg = "该用户可以享受五折优惠，已返回五折后价格";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "请求出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
