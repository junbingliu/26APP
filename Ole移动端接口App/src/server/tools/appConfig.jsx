//#import Util.js
//#import pigeon.js
//#import DESEncryptUtil.js
//#import session.js

(function () {
    var version = $.params['version'];//配置信息版本

    var ret = {code: 'ok', msg: ''};
    var config = ps20.getContent('appConfig_ole');
    if (!config) {
        ret.code = 'err';
        ret.msg = '数据库未配置APP配置信息';
        out.print(JSON.stringify(ret));
        return;
    }
    config = JSON.parse(config + "");
    var appKey = config.appKey;
    var appId = config.appId;
    var appVersion = config.version;
    //var sessionId = SessionService.getSessionId(request);
    //ret.sessionId = sessionId;

    if (version && version == appVersion) {
        ret.code = "noChange";
        ret.msg = "没有修改";
        ret.version = appVersion;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!appKey) {
        ret.code = 'err';
        ret.msg = '服务端AppKey未配置';
        out.print(JSON.stringify(ret));
        return;
    }
    var jData = config.data;
    if (!jData) {
        ret.code = 'err';
        ret.msg = '服务端未配置数据';
        out.print(JSON.stringify(ret));
        return;
    }

    var getRanString = function (len) {
        var str = "";
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        for (var i = 0; i < len; i++) {
            var pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    };
    var iv = getRanString(8);

    //设置一个测试session值，这样就可以带上cookie了
    SessionService.addSessionValue("test", "test", request, response);

    ret.data = DESEncryptUtil.encSign(appKey, iv, JSON.stringify(jData)) + "";
    ret.iv = iv;
    ret.version = appVersion;
    out.print(JSON.stringify(ret));
})();