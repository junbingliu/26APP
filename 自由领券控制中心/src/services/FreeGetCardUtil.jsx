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
            /*if (!cardBatchId || cardBatchId == "") {
                jResult.code = "103";
                jResult.msg = "批次ID参数错误";
                return jResult;
            }*/

            var lockId = "freeGetCardLock_" + userId + "_" + activityId;
            pigeon.lock(lockId);
            try {
                var jActivity = FreeGetCardService.getActivity(activityId);
                cardBatchId = jActivity.batchIds;
                var checkResult = FreeGetCardService.checkLimitAmount(jActivity, cardBatchId, userId);
                if (checkResult.code != "0") {
                    return checkResult;
                }
                var amount = jActivity.count;//送券数量
                var reason = jActivity.reason;//送券原因
                //真正的绑定卡api
                var jBindCardResult = CardService.batchBindCards2UserNoPwd(userId, cardBatchId, amount, reason);
                if (jBindCardResult.code == "0") {
                    //全部成功，记录领券记录
                    FreeGetCardService.updateLimitAmount(activityId, userId, amount);
                } else if (jBindCardResult.code == "110") {
                    //部分成功，记录领券记录
                    var success_cardNum = jBindCardResult.success_cardNum;
                    if (success_cardNum) {
                        var scnIds = success_cardNum.split(",");
                        if (scnIds.length > 0) {
                            FreeGetCardService.updateLimitAmount(activityId, userId, scnIds.length);
                        }
                    }
                } else if (jBindCardResult.code == "103") {
                    jResult.code = "109";
                    jResult.msg = jBindCardResult.msg;
                    return jResult;
                }
                return jBindCardResult;
            } catch (e) {
                jResult.code = "99";
                jResult.msg = "操作出现异常，异常信息为：" + e;
                return jResult;
            } finally {
                pigeon.unlock(lockId);
            }
        }
    };
    return f;
})($S);