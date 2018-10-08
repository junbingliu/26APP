//#import Util.js
//#import HttpUtil.js

var YunruanService = (function () {
    var YunruanServiceApi = new JavaImporter(
        Packages.org.json,
        Packages.java.lang,
        Packages.java.net,
        Packages.net.xinshi.thirdinterface.yunruan
    );

    var f = {
        getMemberByOpenId: function (jArgs, openId) {
            var getMemberByOpenIdUrl = jArgs.getMemberByOpenIdUrl;
            if (!getMemberByOpenIdUrl) {
                return null;
            }

            var data = f.encryptData(jArgs, openId);

            var postData = {};
            postData.openId = data;
            $.log("\n..........................postData=" + JSON.stringify(postData));

            return HttpUtils.postRaw(getMemberByOpenIdUrl, JSON.stringify(postData), {});
        },

        encryptData: function (jArgs, value) {
            var appSecret = jArgs.appSecret;
            if (!appSecret || !value) {
                return "";
            }

            var ENCRYPT_KEY0 = new YunruanServiceApi.String(appSecret).getBytes();
            return YunruanServiceApi.DESedeSecret.getInstance(ENCRYPT_KEY0).getEncryptKey(value) + "";
        },

        decryptData: function (jArgs, value) {
            var appSecret = jArgs.appSecret;
            if (!jArgs || !value) {
                return "";
            }

            var ENCRYPT_KEY0 = new YunruanServiceApi.String(appSecret).getBytes();
            return YunruanServiceApi.DESedeSecret.getInstance(ENCRYPT_KEY0).getDecryptKey(value) + "";
        },

        encryptOleData: function (jArgs, value) {
            var appSecret = jArgs.oleAppSecret;
            if (!appSecret || !value) {
                return "";
            }

            var ENCRYPT_KEY0 = new YunruanServiceApi.String(appSecret).getBytes();
            return YunruanServiceApi.DESedeSecret.getInstance(ENCRYPT_KEY0).getEncryptKey(value) + "";
        },

        decryptOleData: function (jArgs, value) {
            var appSecret = jArgs.oleAppSecret;
            if (!jArgs || !value) {
                return "";
            }

            var ENCRYPT_KEY0 = new YunruanServiceApi.String(appSecret).getBytes();
            return YunruanServiceApi.DESedeSecret.getInstance(ENCRYPT_KEY0).getDecryptKey(value) + "";
        }
    };
    return f;
})();