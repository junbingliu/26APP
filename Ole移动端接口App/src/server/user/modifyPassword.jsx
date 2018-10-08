//#import Util.js
//#import login.js
//#import user.js
//#import DigestUtil.js
//#import @server/util/ErrorCode.jsx

(function () {
    var password = $.params.password;//新密码
    var oldPassword = $.params.oldPassword;//旧密码

    var ret = ErrorCode.S0A00000;
    if (!password) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var jUser = LoginService.getFrontendUser();
    if (!jUser) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (password.length > 20 || password.length < 6) {
        ret = ErrorCode.user.E1B02031;
        out.print(JSON.stringify(ret));
        return;
    }

    var ran = Math.random() + "";
    var passran = password + ran;
    var passwordsha = DigestUtil.digestString(passran, "SHA");//加密密码
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
            ret = ErrorCode.user.E1B02032;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    jUser["passwordhash"] = passwordsha;//重新保存密码
    jUser["random"] = ran;//随机数
    jUser["lastModifiedTime"] = new Date().getTime() + "";
    UserService.updateUser(jUser, jUser.id);

    out.print(JSON.stringify(ret));
})();