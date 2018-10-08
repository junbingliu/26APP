//#import pigeon.js
//#import card.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx

var FreeGetCardUtil = (function (pigeon) {
    var f = {
        doGiveCard: function (userId, activityId, cardBatchId) {
            var jResult = {};
            if (!userId || userId == "") {
                jResult.code = "101";
                jResult.msg = "用户ID参数错误";
                return jResult;
            }
            if (!activityId || activityId == "") {
                jResult.code = "102";
                jResult.msg = "领券活动ID参数错误";
                return jResult;
            }
            if (!cardBatchId || cardBatchId == "") {
                jResult.code = "103";
                jResult.msg = "批次ID参数错误";
                return jResult;
            }

            var lockId = "freeGetCardLock_" + userId + "_" + activityId;
            pigeon.lock(lockId);
            try {
                var jActivity = FreeGetCardService.getActivity(activityId);
                var checkResult = FreeGetCardService.checkLimitAmount(jActivity, cardBatchId, userId);
                if (checkResult.code != "0") {
                    return checkResult;
                }
                var amount = jActivity.count;//送券数量
                var reason = jActivity.reason;//送券原因
                //真正的绑定卡api
                var jBindCardResult = CardService.batchBindCards2UserByCps(cardBatchId, userId, amount);
                if (jBindCardResult.state == "ok") {
                    //全部成功，记录领券记录
                    FreeGetCardService.updateLimitAmount(activityId, userId, amount);
                    jResult.code = "0";
                    jResult.msg = jBindCardResult.msg;
                    return jResult;
                } else if (jBindCardResult.state == "parterr") {
                    //部分成功，记录领券记录
                    var success_cardNum = jBindCardResult.success_cardNum;
                    if (success_cardNum) {
                        var scnIds = success_cardNum.split(",");
                        if (scnIds.length > 0) {
                            FreeGetCardService.updateLimitAmount(activityId, userId, scnIds.length);
                        }
                    }
                    jResult.code = "110";
                    jResult.msg = jBindCardResult.msg;
                    return jResult;
                } else if (jBindCardResult.state == "err") {
                    jResult.code = "err";
                    jResult.msg = jBindCardResult.msg;
                    return jResult;
                }
            } catch (e) {
                jResult.code = "err";
                jResult.msg = "系统异常，异常信息为：" + e;
                return jResult;
            } finally {
                pigeon.unlock(lockId);
            }
        }
    };
    return f;
})($S);