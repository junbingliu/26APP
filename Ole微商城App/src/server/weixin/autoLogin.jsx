//#import Util.js
//#import login.js
//#import user.js
//#import base64.js
//#import $ewjMobileApi:services/MobileApiService.jsx
//#import $yunruanInterface:services/YunruanArgService.jsx
//#import $yunruanInterface:services/YunruanService.jsx

/**
 * 这个地址需配置到微信菜单，用于访问h5商城时自动登录
 */
(function () {
    // try {
    var returnUrl = "/wjsWechatApp/index.jsx";//这个地址需要改成ole h5商城的地址
    var thirdParams = $.params["thirdParams"];
    var params = $.params["param"];
    if (!params) {
        out.print("非法请求");
        return;
    }
    $.log(".............thirdParams:" + thirdParams);
    if (thirdParams) {
        try {
            returnUrl = Base64.decode(thirdParams, "");//我们将这个thirdParams传url给云软件，如果有传这个url，则跳转到这个页面，这样的话，这个页面就可以通用了
        } catch (e) {
            $.log(".............base64 decode error:" + e);
        }
    }
    $.log(".............returnUrl:" + returnUrl);

    var jArgs = YunruanArgService.getArgs();
    if (!jArgs) {
        out.print("对接参数未配置");
        return;
    }

    var s = YunruanService.decryptOleData(jArgs, params);
    var jParams = JSON.parse(s);
    $.log("...............jParams:" + JSON.stringify(jParams));
    var wxOpenId = jParams.openid;
    if (!wxOpenId) {
        return null;
    }
    var uId = LoginService.judgeMemberField(wxOpenId, "weixin");
    var jUser = UserService.getUser(uId);
    if (jUser) {
        LoginService.loginFrontendByUserId(uId);
        response.sendRedirect(returnUrl);
        return;
    }

    var getMemberByOpenIdUrl = jArgs.getMemberByOpenIdUrl;
    if (!getMemberByOpenIdUrl) {
        return null;
    }
    var beginTime = new Date().getTime();
    var data = YunruanService.encryptOleData(jArgs, wxOpenId);
    var postData = {};
    postData.openId = data;
    $.log("\n..........................postData=" + JSON.stringify(postData));

    var us = HttpUtils.postRaw(getMemberByOpenIdUrl, JSON.stringify(postData), {});
    var endTime = new Date().getTime();
    $.log(".................getMember time :" + (endTime - beginTime));
    $.log("\n..........................us=" + us);
    us = us.replace(/'/g, "\"");
    $.log("\n..........................us2=" + us);
    // if(true){
    //     out.print(us);
    //     return;
    // }
    var jUserInfo = JSON.parse(us + "");
    var weixinUnionId = jUserInfo.unionId;
    if (!weixinUnionId || weixinUnionId == "") {
        $.log("\n.................111111......." + JSON.stringify({code: "100", errorCode: "获取微信授权信息失败, unionId为空"}));
        out.print(JSON.stringify({code: "101", errorCode: "获取微信授权信息失败, unionId为空"}));
        return;
    }

    var memberId = jUserInfo.memberId || "";
    var mobilePhone = jUserInfo.phone || "";
    var logo = jParams.headimgurl || "";
    var nickName = jParams.nickname || "";

    if (weixinUnionId == wxOpenId) {
        $.log("\n.................111111......." + JSON.stringify({
            code: "101",
            errorCode: "获取微信授权信息失败, unionId和openId相等"
        }));
        out.print(JSON.stringify({code: "101", errorCode: "获取微信授权信息失败, unionId和openId相等"}));
        return;
    }
    var lockId = "weixinAutoLogin_" + weixinUnionId;
    try {
        MobileApiService.getPigeon().lock(lockId);
        var uId = LoginService.judgeMemberField(weixinUnionId, "weixinUnion");
        var jUser = UserService.getUser(uId);
        if (jUser) {
            //如果user已经有了ole微信OpenId，那要把原来的微信openId和会员Id解绑
            if (jUser.oleWxOpenId && jUser.oleWxOpenId != wxOpenId) {
                var oldUserId = LoginService.judgeMemberField(jUser.oleWxOpenId, "weixin");
                if (oldUserId) {
                    UserService.removeMemberField(jUser.openId, oldUserId, "weixin");//删除旧的绑定关系
                }
            }
            //将openID与会员做绑定
            jUser.oleWxOpenId = wxOpenId;
            jUser.openId = wxOpenId;
            UserService.addMemberField(wxOpenId, uId, "weixin");//将openID也绑定到会员
            UserService.updateUser(jUser, "u_0");
            LoginService.loginFrontendByUserId(uId);

            response.sendRedirect(returnUrl);
            return;
        }

        jUser = {};
        jUser["isAdmin"] = "0";
        jUser["merchantId"] = "";
        jUser["source_isOnline"] = "1";//是否线上
        jUser["ip"] = $.getClientIp();
        jUser["userCardBindStatus"] = "0";
        jUser["isEnable"] = "1";//1表示激活
        jUser["mobilPhone"] = "";
        jUser["checkedemailStatus"] = "0";
        jUser["checkedphoneStatus"] = "0";
        jUser["weixinUnionId"] = weixinUnionId;
        jUser["source"] = "weixin";//来源
        jUser["source_entrance"] = "default";
        jUser["nickName"] = nickName;
        jUser["logo"] = logo;
        jUser["gender"] = "2";
        jUser["memberid"] = memberId;
        jUser["oleWxOpenId"] = wxOpenId;
        jUser["openId"] = wxOpenId;
        jUser["wjcsPhone"] = mobilePhone;
        jUser["channel"] = {ole: {name: "ole", addTime: new Date().getTime()}};
        jUser["exChannel"] = "ole";//一级渠道
        jUser["subExChannel"] = "weixin";//二级渠道


        var userId = UserService.register(jUser, null);
        UserService.addMemberField(weixinUnionId, userId, "weixinUnion");//将unionID绑定到会员
        UserService.addMemberField(wxOpenId, userId, "weixin");//将openID也绑定到会员

        LoginService.loginFrontendByUserId(userId);
        response.sendRedirect(returnUrl);
    } finally {
        MobileApiService.getPigeon().unlock(lockId);
    }
    // } catch (e) {
    //     $.log(e+"");
    //     out.print(JSON.stringify({code: "99", errorCode: "系统异常，请稍后再试"}));
    // }
})();
