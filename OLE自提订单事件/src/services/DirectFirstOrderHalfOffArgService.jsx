//#import Util.js
//#import pigeon.js
//#import DateUtil.js

var DirectFirstOrderHalfOffArgService = (function (pigeon) {
    var prefix_obj = "DirectFirstOrderHalfOffEventObj";

    var f = {
        saveArgs: function (jArgs) {
            var id = f.getArgsId();
            jArgs.id = id;

            pigeon.saveObject(id, jArgs);
        },
        getArgs: function () {
            var id = f.getArgsId();
            return pigeon.getObject(id);
        },
        getArgsId: function () {
            return prefix_obj + "_Args_100";
        },
        getArgValueByKey: function (valueKey) {
            var jArgs = f.getArgs();
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        },
        getValueByKey: function (jArgs, valueKey) {
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        },
        checkMerchantId: function (jArgs, merchantId) {
            var jResult = {};
            if (!merchantId || merchantId == "") {
                jResult.code = "101";
                jResult.msg = "merchantId为空";
                return jResult;
            }
            if (!jArgs) {
                jArgs = f.getArgs();
            }
            if (!jArgs) {
                jResult.code = "102";
                jResult.msg = "适用的商家参数未设置";
                return jResult;
            }

            var merchantIds = jArgs.merchantIds;
            if (!merchantIds) {
                jResult.code = "103";
                jResult.msg = "适用的商家参数未设置";
                return jResult;
            }

            var isMatched = false;
            var mIds = merchantIds.split(",");
            for (var i = 0; i < mIds.length; i++) {
                if (merchantId == mIds[i]) {
                    isMatched = true;
                    break;
                }
            }

            if (!isMatched) {
                jResult.code = "104";
                jResult.msg = "merchantId为【" + merchantId + "】不在适用的商家范围内";
                return jResult;
            }

            jResult.code = "0";
            jResult.msg = "验证通过";
            return jResult;
        }
    };
    return f;
})($S);