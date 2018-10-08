//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import md5Service.js
//#import sysArgument.js
//#import DigestUtil.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/LoginUtil.jsx
//#import @server/util/UserUtil.jsx

(function () {
    var mobilePhone = $.params.mobilePhone;//手机
    var parentId = $.params.parentId;//推广员ID
    var password = $.params.password;//密码
    var phoneValidateCode = $.params.validateCode;//短信验证码
    var source = $.params.source || "quickRegister";//注册来源

    var ret = ErrorCode.S0A00000;
    if (!mobilePhone) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!password) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    if (password.length > 16 || password.length < 6) {
        ret = ErrorCode.user.E1B02025;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!phoneValidateCode) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == phoneValidateCode) {
        //等于万能验证码，直接验证通过
    } else {
        var validatePhone = SessionService.getSessionValue("phoneValidatePhone", request);//接收短信的手机号码
        if (!validatePhone) {
            ret = ErrorCode.user.E1B02019;
            out.print(JSON.stringify(ret));
            return;
        }
        if (validatePhone != mobilePhone) {
            ret = ErrorCode.user.E1B02020;
            out.print(JSON.stringify(ret));
            return;
        }
        var sessionKey = "phoneValidateCode";
        var sendObj = SessionService.getSessionValue(sessionKey, request);//正确短信验证码
        if (!sendObj) {
            ret = ErrorCode.user.E1B02019;
            out.print(JSON.stringify(ret));
            return;
        }
        var inTime = 30 * 60 * 1000;//暂时确定半小时的有效期
        var now = new Date().getTime();
        sendObj = sendObj.split("-");
        var sendTime = sendObj[1];
        var vCode = sendObj[0];
        if (now - inTime > sendTime) {
            ret = ErrorCode.user.E1B02021;
            out.print(JSON.stringify(ret));
            return;
        }
        if (phoneValidateCode != vCode) {
            ret = ErrorCode.user.E1B02022;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    if (parentId == mobilePhone) {
        ret = ErrorCode.user.E1B02026;
        out.print(JSON.stringify(ret));
        return;
    }
    var parentUser = null;
    if (parentId) {
        try {
            parentUser = UserService.getUserByKey(parentId);
            if (!parentUser) {
                ret = ErrorCode.user.E1B02027;
                out.print(JSON.stringify(ret));
                return;
            }
        } catch (e) {
            ret = ErrorCode.user.E1B02027;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var jUserKey = UserService.getUserByKey(mobilePhone);
    if (jUserKey && UserUtil.isOleMember(jUserKey)) {//已存在，并且是Ole会员
        ret = ErrorCode.user.E1B02028;
        out.print(JSON.stringify(ret));
        return;
    }
    if (jUserKey) {
        var userId = jUserKey.id;
        UserUtil.addToOleMember(jUserKey);
        var ran = Math.random() + "";
        var passran = password + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");//加密密码
        jUserKey.nickName = mobilePhone;
        jUserKey["passwordhash"] = passwordsha;
        jUserKey["random"] = ran;
        jUserKey["lastModifiedTime"] = new Date().getTime() + "";
        UserService.updateUser(jUserKey, userId);
        //重新注册的会员也触发注册奖励
        LoginApi.UserRegisterUtil.executeRegisterPlan(userId);//执行注册奖励事件
        if (parentId) {
            LoginApi.UserRegisterUtil.executeRecommendPlan(parentId, userId);//执行推荐奖励事件
        }
    } else {
        var jUser = {};
        var selfApi = new JavaImporter(Packages.java.net.InetAddress);
        var localIP = selfApi.InetAddress.getLocalHost().getHostAddress();
        //登录成功就把验证码失效
        SessionService.removeSessionValue(sessionKey);

        jUser.isEnable = "1";
        jUser.loginId = mobilePhone;
        jUser.mobilPhone = mobilePhone;
        jUser.nickName = mobilePhone;
        jUser.mobil = mobilePhone;
        jUser.source_isOnline = "1";//线上
        jUser.source = "phone";//来源写死了是手机端
        jUser.source_entrance = source;//注册的来源
        jUser.parentId = parentUser && parentUser.id || "";
        jUser.createTime = new Date().getTime();
        jUser.serverIP = localIP + "";
        jUser.checkedphoneStatus = "1";
        jUser.memberid = "0";//普通用户默认memberid为0

        UserUtil.addToOleMember(jUser);

        var ran = Math.random() + "";
        var passran = password + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");//加密密码
        jUser["passwordhash"] = passwordsha;
        jUser["random"] = ran;
        jUser["lastModifiedTime"] = new Date().getTime() + "";

        var userId = UserService.register(jUser, 'u_sys') + "";//添加会员
        if (userId) {
            jUser = UserService.getUser(userId);
        } else {
            ret = ErrorCode.E1M000002;
            out.print(JSON.stringify(ret));
            return;
        }
        UserService.addMemberField(mobilePhone, userId, "");//绑定手机号与会员关联关系

        LoginApi.UserRegisterUtil.executeRegisterPlan(jUser.id);//执行注册奖励事件
        if (parentId) {
            LoginApi.UserRegisterUtil.executeRecommendPlan(parentId, jUser.id);//执行推荐奖励事件
        }
    }
    //使用userId登录
    LoginService.loginFrontendByUserId(userId);

    ret.data = {
        userId: userId,
        token: LoginUtil.getLoginToken(mobilePhone),
        isOpenCard: 'N'//是否开卡,Y:已开卡，N:未开卡 todo，调用线下接口未实现
    };
    ret.msg = "注册成功";
    out.print(JSON.stringify(ret));
})();