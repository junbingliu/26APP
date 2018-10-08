//#import Util.js
//#import user.js
//#import login.js
//#import sysArgument.js
//#import md5Service.js
//#import DESEncryptUtil.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/LoginUtil.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/UserUtil.jsx

(function () {
    var data = $.params.data;//加密参数，含:openid,nickName,logo,type
    var iv = $.params.iv;//随机数

    var ret = ErrorCode.S0A00000;
    if (!data || !iv) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var key = CommonUtil.getEncryptAppKey();
    if (!key) {
        ret = ErrorCode.E1M000004;
        out.print(JSON.stringify(ret));
        return;
    }
    var codeStr = DESEncryptUtil.decSign(key, iv, data) + "";
    if (!codeStr) {
        ret = ErrorCode.E1M000005;
        out.print(JSON.stringify(ret));
        return;
    }

    try {
        var jCode = JSON.parse(codeStr);
    } catch (e) {
        ret = ErrorCode.E1M000001;
        out.print(JSON.stringify(ret));
        return;
    }
    var openid = jCode.openid;//openId
    var nickName = jCode.nickName;//昵称
    var logo = jCode.logo;//头像地址
    var type = jCode.type;//第三方登录的类型，qq,weixin,sina
    var action = jCode.action || 'login';//类型，可以是登录或者绑定,默认是登录

    if (type != "qq" && type != "weixin" && type != "sina") {
        ret = ErrorCode.user.E1B02030;
        out.print(JSON.stringify(ret));
        return;
    }
    if (action != "bind" && action != "login") {
        ret = ErrorCode.user.E1B02040;
        out.print(JSON.stringify(ret));
        return;
    }
    var jUser = LoginService.getFrontendUser();
    //如果是绑定，则需要先登录
    if (action == "bind" && jUser == null) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!openid || !nickName) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var userId = UserService.judgeMemberField(openid, type);
    if (action == "login") {
        if (userId && userId != "null") {
            LoginService.loginFrontendByUserId(userId);
        } else {
            jUser = {
                nickName: nickName,
                openId: openid,
                logo: logo || "",
                isEnable: "1",//已激活
                source: type,
                memberid: "0",
                source_entrance: "default",
                source_isOnline: "1"//线上会员
            };
            jUser[type + "OpenId"] = openid;
            jUser[type + "NickName"] = nickName;
            jUser[type + "Logo"] = logo;

            UserUtil.addToOleMember(jUser);
            //注册会员
            userId = UserService.register(jUser, null);
            //登录到前台
            LoginService.loginFrontendByUserId(userId);
            //绑定openId的关联关系
            UserService.addMemberField(openid, userId, type);
        }
    } else {
        if (userId && userId != "null") {
            //如果是绑定需要判断是不是重复绑定
            ret = ErrorCode.user.E1B02041;
            out.print(JSON.stringify(ret));
            return;
        }
        if(!jUser.nickName){
            jUser.nickName = nickName;
        }
        if(!jUser.logo){
            jUser.logo = logo;
        }
        if(!jUser.openId){
            jUser.openId = openid;
        }
        jUser[type + "OpenId"] = openid;
        jUser[type + "NickName"] = nickName;
        jUser[type + "Logo"] = logo;
        UserService.addMemberField(openid, jUser.id, type);//绑定openId的关联关系
        //保存会员
        UserService.updateUser(jUser, jUser.id);
    }
    ret.msg = "登录成功";
    ret.data = {
        userId: userId + "",
        token: LoginUtil.getLoginToken(userId)
    };
    out.print(JSON.stringify(ret));
})();