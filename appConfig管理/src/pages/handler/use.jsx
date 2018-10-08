//#import Util.js
//#import login.js
//#import $appConfig:services/AppConfigLogService.jsx
(function () {
    var id = $.params['id'];

    var ret = {
        state: 'err'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!id) {
        ret.msg = "请输入参数ID。";
        out.print(JSON.stringify(ret));
        return;
    }

    var jLog = AppConfigLogService.getById(id);
    if (jLog) {
        var id = jLog.id;
        var data = jLog.data;
        if (data) {
            var str = ps20.getContent(id) + "";
            if (!str) {
                str = "{}";
            }
            jLog = {
                createUserId: loginUserId,
                oldData: JSON.parse(str),
                data: data
            };
            AppConfigLogService.add(jLog);

            ps20.saveContent(id, JSON.stringify(data));
            ret.state = "ok";
            ret.msg = "使用当前版本成功。";
            out.print(JSON.stringify(ret));
        } else {
            ret.msg = "数据为空。";
            out.print(JSON.stringify(ret));
        }
    } else {
        ret.msg = "保存获取日志失败。";
        out.print(JSON.stringify(ret));
    }
})();