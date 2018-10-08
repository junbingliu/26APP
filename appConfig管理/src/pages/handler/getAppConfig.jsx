//#import Util.js
(function () {
    try {
        var type = $.params['type'];
        if (type == 'ole') {
            var str = ps20.getContent('appConfig_ole') + "";
        } else {
            var str = ps20.getContent('appConfig_wj') + "";
        }
        if (!str) {
            str = {};
        }
        var ret = {
            state: 'ok',
            data: str
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        var ret = {
            state: "err",
            msg: "出现异常" + e
        };
        out.print(JSON.stringify(ret));
    }
})();