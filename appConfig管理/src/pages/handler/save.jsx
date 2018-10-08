//#import Util.js
//#import login.js
//#import $appConfig:services/AppConfigLogService.jsx
(function () {
    var data = $.params['data'];
    var type = $.params['type'];

    var ret = {
        state: 'err'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!data) {
        ret.msg = "请输入参数data。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (type == "ole") {
        var str = ps20.getContent('appConfig_ole') + "";
    } else {
        var str = ps20.getContent('appConfig_wj') + "";
    }
    if (!str) {
        str = "{}";
    }
    var jLog = {
        createUserId: loginUserId,
        oldData: JSON.parse(str),
        data: JSON.parse(data)
    };
    var id = AppConfigLogService.add(jLog);
    if (id) {
        if (type == "ole") {
            ps20.saveContent('appConfig_ole', data);
        } else {
            ps20.saveContent('appConfig_wj', data);
        }
        ret.state = "ok";
        ret.msg = "保存成功。";
        out.print(JSON.stringify(ret));
    } else {
        ret.msg = "保存失败。";
        out.print(JSON.stringify(ret));
    }
})();