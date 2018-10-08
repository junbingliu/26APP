//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import md5Service.js
//#import sysArgument.js
//#import DigestUtil.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/LoginUtil.jsx

(function () {
    var ret =  ErrorCode.S0A00000;
    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    //var buyerId = "u_50000";//u_4110001
    if (!buyerId) {
        ret.msg = "用户不存在！";
        out.print(JSON.stringify(ret));
    }else{
        var oldPassword = $.params.oldPassword;//旧密码
        var password = $.params.password;//密码
        var surepassword = $.params.surepassword;//确认密码
        if (!password) {
            ret = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret));
            return;
        }
        if (!surepassword) {
            ret = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret));
            return;
        }
        if (password.length > 16 || password.length < 6) {
            ret = ErrorCode.user.E1B02025;
            out.print(JSON.stringify(ret));
            return;
        }
        if (surepassword.length > 16 || surepassword.length < 6) {
            ret = ErrorCode.user.E1B02025;
            out.print(JSON.stringify(ret));
            return;
        }
        if (surepassword != password) {
            ret = ErrorCode.user.E1B02031;
            out.print(JSON.stringify(ret));
            return;
        }
        //获取用户信息
        var jUser = UserService.getUser(buyerId);

        if(jUser.passwordhash){
            var newPasswordsha = DigestUtil.digestString(password + jUser.random, "SHA");//加密密码
            if(jUser.passwordhash == newPasswordsha){
                ret = ErrorCode.user.E1B02034;
                out.print(JSON.stringify(ret));
                return;
            }
        }
        if (oldPassword && oldPassword) {
            var oldPasswordsha = DigestUtil.digestString(oldPassword + jUser.random, "SHA");//比较旧密码
            if (oldPasswordsha != jUser.passwordhash) {
                ret = ErrorCode.user.E1B02050;
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var ran = Math.random() + "";
        var passran = password + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");//加密密码
        jUser["passwordhash"] = passwordsha;
        jUser["random"] = ran;
        jUser["lastModifiedTime"] = new Date().getTime() + "";

        if (buyerId) {
            UserService.updateUser(jUser, buyerId);
        } else {
            ret = ErrorCode.E1M000002;
            out.print(JSON.stringify(ret));
            return;
        }

        ret.msg = "密码修改成功";
        out.print(JSON.stringify(ret));
    }

})();