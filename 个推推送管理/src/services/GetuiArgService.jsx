//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import email.js

var GetuiArgService = (function (pigeon) {
    var prefix = "getui";

    var f = {
        saveArgs: function (merchantId, jArgs) {
            var id = f.getArgsId(merchantId);
            jArgs.id = id;

            pigeon.saveObject(id, jArgs);
        },
        getArgs: function (merchantId) {
            merchantId = "head_merchant";
            var id = f.getArgsId(merchantId);
            return pigeon.getObject(id);
        },
        getArgsId: function (merchantId) {
            return prefix + "_" + merchantId + "_Args";
        },
        checkArgs: function (merchantId) {
            var ret = {state: 'err', msg: ''};
            if (!merchantId) {
                ret.msg = "商家ID不能为空";
                return ret;
            }
            var jArgs = f.getArgs(merchantId);
            if (!jArgs) {
                ret.msg = "商家参数未设置";
                return ret;
            }
            if (jArgs.isEnable != "Y") {
                ret.msg = merchantId + "商家没有启用对接";
                return ret;
            }
            ret.state = 'ok';
            ret.args = jArgs;
            return ret;
        },
        checkMerchantId: function (merchantId) {
            var jResult = {};
            if (!merchantId || merchantId == "") {
                jResult.code = "101";
                jResult.msg = "merchantId为空";
                return jResult;
            }
            var jArgs = f.getArgs();
            if (!jArgs) {
                jResult.code = "102";
                jResult.msg = "商家参数未设置";
                return jResult;
            }

            var merchantIds = jArgs.mIds;
            if (!merchantIds) {
                jResult.code = "103";
                jResult.msg = "商家参数未设置";
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
                jResult.msg = "merchantId为【" + merchantId + "】不在商家范围内";
                return jResult;
            }

            jResult.code = "0";
            jResult.msg = "验证通过";
            return jResult;
        },
        getArgValueByKey: function (merchantId, valueKey) {
            var jArgs = f.getArgs(merchantId);
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        },
        getArgValueByKeyExt: function (jArgs, valueKey) {
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        }
    };
    return f;
})($S);