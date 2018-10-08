//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import md5Service.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/LoginUtil.jsx
//#import @server/util/UserUtil.jsx

(function () {
    //这个是登录的接口
    var ret = ErrorCode.S0A00000;
    var loginId = $.params['loginId'];
    var password = $.params['password'];
    if (!loginId || !password) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var jUser = UserService.getUserByKey(loginId);
    if (!jUser) {
        ret = ErrorCode.user.E1B02015;
        out.print(JSON.stringify(ret));
        return;
    }
    //如果不是Ole会员，那就当成未注册
    // if (!UserUtil.isOleMember(jUser)) {
    //     ret = ErrorCode.user.E1B02024;
    //     out.print(JSON.stringify(ret));
    //     return;
    // }
    var result = LoginService.loginFrontend(loginId, password);
    if (result.state) {
        ret.msg = "登录成功";
        ret.data = {
            userId: result.userId,
            sessionId: SessionService.getSessionId(request),
            token: LoginUtil.getLoginToken(loginId)
        };
        out.print(JSON.stringify(ret));
    } else {
        if (result.code == "104") {
            ret = ErrorCode.user.E1B02015;
            out.print(JSON.stringify(ret));
        } else if (result.code == '105') {
            ret = ErrorCode.user.E1B02016;
            out.print(JSON.stringify(ret));
        } else if (result.code == '101') {
            ret = ErrorCode.user.E1B02017;
            out.print(JSON.stringify(ret));
        } else if (result.code == '102') {
            ret = ErrorCode.user.E1B02017;
            out.print(JSON.stringify(ret));
        } else if (result.code == '103') {
            ret = ErrorCode.user.E1B02015;
            out.print(JSON.stringify(ret));
        } else {
            ret = ErrorCode.user.E1B02018;
            out.print(JSON.stringify(ret));
        }
    }
})();