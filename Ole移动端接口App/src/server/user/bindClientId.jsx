//#import Util.js
//#import login.js
//#import user.js
//#import appPush.js
//#import @server/util/ErrorCode.jsx

(function () {
    var clientId = $.params.clientId;//clientId

    var ret = ErrorCode.S0A00000;
    if (!clientId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var jUser = LoginService.getFrontendUser();
    //var userId = "u_50000";
    //var jUser = UserService.getUser(userId);
    if (!jUser) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var cidObj = UserService.updateUserClientId(clientId,jUser.id);
    var cidstr = cidObj.state;
    if(cidstr != "ok"){
        ret.code = "E1M000056";
        ret.msg = cidObj.msg;
        out.print(JSON.stringify(ret));
        return;
    }
    //如果会员原来的clientId和现在的一样，直接返回成功
    if (jUser.clientId == clientId) {
        out.print(JSON.stringify(ret));
        return;
    }
    //更新clientId
    jUser.clientId = clientId;
    UserService.updateUser(jUser, jUser.id);
    //绑定别名
    AppPushService.bindAlias(jUser.id, clientId);
    out.print(JSON.stringify(ret));
})();