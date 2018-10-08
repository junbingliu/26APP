//#import pigeon.js

var FreeGetCardService = (function (pigeon) {
    var prefix = "freeGetCard";

    var f = {
        addActivity: function (operatorUserId, jTempAct) {
            var idNum = pigeon.getId("freeGetCardActivity");
            var id = prefix + "_act_" + idNum;
            var createTime = (new Date()).getTime();
            var jAct = {
                id: id,
                merchantId: jTempAct.merchantId,
                createUserId: operatorUserId,
                name: jTempAct.name,
                isEnable: jTempAct.isEnable,
                beginTime: jTempAct.beginTime,
                endTime: jTempAct.endTime,
                batchIds: jTempAct.batchIds,
                count: jTempAct.count,
                amount: jTempAct.amount,
                reason: jTempAct.reason,
                desc: jTempAct.desc,
                createTime: createTime
            };
            pigeon.saveObject(id, jAct);
            var listId = prefix + "_" + jTempAct.merchantId + "_AllActivities";
            var key = pigeon.getRevertComparableString(jAct.createTime / 1000, 13);
            pigeon.addToList(listId, key, id);
        },

        saveActivity: function (jAct) {
            var id = jAct.id;
            if (id.indexOf(prefix + "_act_") == -1) {
                return;
            }
            pigeon.saveObject(id, jAct);
        },

        getActivity: function (id) {
            return pigeon.getObject(id);
        },

        deleteActivity: function (id, userId) {
            if (id.indexOf(prefix + "_act_") == -1) {
                return;
            }
            var jActivity = f.getActivity(id);
            if (!jActivity) {
                return;
            }
            pigeon.saveObject(id, null);
            var listId = prefix + "_" + jActivity.merchantId + "_AllActivities";
            var key = pigeon.getRevertComparableString(jActivity.createTime / 1000, 13);
            pigeon.deleteFromList(listId, key, id);

        },

        getActivityList: function (merchantId, start, limit) {
            var listId = prefix + "_" + merchantId + "_AllActivities";
            return pigeon.getListObjects(listId, start, limit);
        },

        getActivityListCount: function (merchantId) {
            var listId = prefix + "_" + merchantId + "_AllActivities";
            return pigeon.getListSize(listId);
        },

        updateLimitAmount: function (actId, userId, count) {
            var jLimitAmount = f.getLimitAmount(actId, userId);
            if (!jLimitAmount) {
                var id = prefix + "_limitAmount_" + actId + "_" + userId;
                jLimitAmount = {
                    id: id,
                    actId: actId,
                    userId: userId,
                    amount: 0
                };
            }
            jLimitAmount.amount = Number(jLimitAmount.amount) + Number(count);
            pigeon.saveObject(jLimitAmount.id, jLimitAmount);
        },

        getLimitAmount: function (actId, userId) {
            var id = prefix + "_limitAmount_" + actId + "_" + userId;
            return pigeon.getObject(id);
        },

        /**
         * 检查用户在某个活动中是否还能领券
         * @param jActivity
         * @param cardBatchId
         * @param userId
         * @returns {{}}
         */
        checkLimitAmount: function (jActivity, cardBatchId, userId) {
            var jResult = {};
            if (!jActivity) {
                jResult.code = "200";
                jResult.msg = "领券活动不存在";
                return jResult;
            }
            var actId = jActivity.id;
            if (!jActivity.isEnable || jActivity.isEnable != "true") {
                jResult.code = "201";
                jResult.msg = "当前领券活动未生效";
                return jResult;
            }
            if (jActivity.amount <= 0) {
                jResult.code = "202";
                jResult.msg = "当前领券活动可领用数量不可用";
                return jResult;
            }
            var curTime = (new Date()).getTime();
            var longBeginTime = new Date(jActivity.beginTime);
            var longEndTime = new Date(jActivity.endTime);
            if (curTime < longBeginTime || curTime > longEndTime) {
                jResult.code = "203";
                jResult.msg = "当前领券活动不在有效期内";
                return jResult;
            }
            var jLimitAmount = f.getLimitAmount(actId, userId);
            if (jLimitAmount) {
                if (jActivity.amount - jLimitAmount.amount < jActivity.count ) {
                    jResult.code = "204";
                    jResult.msg = "超出当前领券活动最大领券数量：" + jActivity.amount;
                    return jResult;
                }
            }
            var isMatch = false;
            var matchBatches = jActivity.batchIds;
            var batches = matchBatches.split(",");
            for (var i = 0; i < batches.length; i++) {
                if (cardBatchId == batches[i]) {
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                jResult.code = "205";
                jResult.msg = "券类型不在当前领券活动中";
                return jResult;
            }
            jResult.code = "0";
            jResult.msg = "验证通过";
            return jResult;
        },
        /**
         * 校验活动有效性
         * @param jActivity
         * @returns {{}}
         */
        checkActivity: function (jActivity) {
            var jResult = {};
            if (!jActivity) {
                jResult.code = "300";
                jResult.msg = "领券活动不存在";
                return jResult;
            }
            var actId = jActivity.id;
            if (!jActivity.isEnable || jActivity.isEnable != "true") {
                jResult.code = "301";
                jResult.msg = "当前领券活动未生效";
                return jResult;
            }
            if (jActivity.amount <= 0) {
                jResult.code = "302";
                jResult.msg = "当前领券活动可领用数量不可用";
                return jResult;
            }
            var curTime = (new Date()).getTime();
            var longBeginTime = new Date(jActivity.beginTime);
            var longEndTime = new Date(jActivity.endTime);
            if (curTime < longBeginTime || curTime > longEndTime) {
                jResult.code = "303";
                jResult.msg = "当前领券活动不在有效期内";
                return jResult;
            }

            jResult.code = "0";
            jResult.msg = "验证通过";
            return jResult;
        }

    };
    return f;
})($S);