//#import Util.js
//#import login.js
//#import user.js
//#import @server/util/ErrorCode.jsx

(function () {
    var bindType = $.params.bindType;//绑定的类型 qq weixin sina
    var openid = $.params.openid;//openId
    var nickName = $.params.nickName;//nickName
    var logo = $.params.logo;//logo

    var ret = ErrorCode.S0A00000;
    if (!bindType || !openid) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    if (bindType != "qq" && bindType != "weixin" && bindType != "sina") {
        ret = ErrorCode.user.E1B02033;
        out.print(JSON.stringify(ret));
        return;
    }
    var jUser = LoginService.getFrontendUser();
    if (!jUser) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if(jUser[bindType+"OpenId"]){
        ret = ErrorCode.user.E1B02034;
        out.print(JSON.stringify(ret));
        return;
    }
    jUser.openId = openid;
    jUser.logo = logo || jUser.logo;
    jUser.nickName = nickName || jUser.nickName;
    jUser[bindType+"OpenId"] = openid;
    jUser[bindType+"NickName"] = nickName;
    jUser[bindType+"Logo"] = logo;

    UserService.addMemberField(openid, jUser.id, bindType);//绑定openId的关联关系

    UserService.updateUser(jUser, jUser.id);
    out.print(JSON.stringify(ret));
})();