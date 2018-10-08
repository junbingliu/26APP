//#import Util.js
//#import login.js
//#import user.js
//#import md5Service.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/UserUtil.jsx

(function () {
    var token = $.params.token;//加密后的token，使用userId和最后登录时间组合

    var ret =  ErrorCode.S0A00000;
    if (!token) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }

    var tokenKey = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "loginTokenKey");
    if (!tokenKey) {
        ret = ErrorCode.user.E1B02011;
        out.print(JSON.stringify(ret));
        return;
    }
    var data = Md5Service.decString(token, tokenKey);
    if (!data) {
        ret = ErrorCode.user.E1B02012;
        out.print(JSON.stringify(ret));
        return;
    }
    var array = data.split("|");//格式 mobilePhone + "|" + lastLoginTime 或 userId + lastLoginTime
    var loginId = array[0];
    if (loginId && array.length == 2) {
        var nowTime = new Date().getTime();
        var lastLoginTime = array[1];
        //超过30天，需要重新登录
        if (nowTime - lastLoginTime > 30 * 24 * 60 * 60 * 1000) {
            ret = ErrorCode.user.E1B02013;
            out.print(JSON.stringify(ret));
            return;
        }
        try {
            var userId = '';
            if (loginId.indexOf("u_") == 0) {
                userId = loginId;
            } else {
                var jUserKey = UserService.getUserByKey(loginId);
                userId = jUserKey.id;
            }
            var jUser = UserService.getUser(userId);
            //如果不是Ole会员，那就当成未注册
            if(!UserUtil.isOleMember(jUser)){
                ret = ErrorCode.user.E1B02024;
                out.print(JSON.stringify(ret));
                return;
            }
            //使用userId登录
            LoginService.loginFrontendByUserId(userId);

            ret.msg = "登录成功";
            ret.data = {
                userId: userId,
                loginId: loginId
            };
            out.print(JSON.stringify(ret));
        } catch (e) {
            $.error("自动登录异常：" + e);
            ret = ErrorCode.E1M000002;
            out.print(JSON.stringify(ret));
        }
    } else {
        ret = ErrorCode.user.E1B02014;
        out.print(JSON.stringify(ret));
    }
})();