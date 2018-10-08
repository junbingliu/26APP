//#import Util.js
//#import login.js
//#import user.js
//#import $ewjMobileApi:services/MobileApiService.jsx
//#import $yunruanInterface:services/YunruanArgService.jsx
//#import $yunruanInterface:services/YunruanService.jsx
//#import $freeGetCardControl:services/FreeGetCardUtil.jsx

/**
 * 扫码领券 这个地址需配置到微信菜单，用于访问h5商城时自动登录，并且自动跳转到这个领券的地址，如果没有注册，则新注册一个会员并发券
 */
(function () {
    // try {
    var returnUrl = "/wjsWechatApp/index.jsx";//这个地址需要改成ole h5商城的地址
    var activityId = $.params["thirdParams"];//活动id
    var params = $.params["param"];
    if (!params) {
        out.print("非法请求");
        return;
    }
    if (!activityId) {
        out.print("领券活动id不能为空");
        return;
    }
    var jArgs = YunruanArgService.getArgs();
    if (!jArgs) {
        out.print("对接参数未配置");
        return;
    }

    var s = YunruanService.decryptOleData(jArgs, params);
    var jParams = JSON.parse(s);
    var wxOpenId = jParams.openid;
    var getMemberByOpenIdUrl = jArgs.getMemberByOpenIdUrl;
    if (!getMemberByOpenIdUrl) {
        return null;
    }

    var data = YunruanService.encryptOleData(jArgs, wxOpenId);
    var postData = {};
    postData.openId = data;
    $.log("\n..........................postData=" + JSON.stringify(postData));

    var us = HttpUtils.postRaw(getMemberByOpenIdUrl, JSON.stringify(postData), {});
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
        if (!jUser) {
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
            jUser["wjcsWxOpenId"] = wxOpenId;
            jUser["wjcsPhone"] = mobilePhone;
            jUser["channel"] = {ole: {name: "ole", addTime: new Date().getTime()}};

            var userId = UserService.register(jUser, null);//注册会员
            UserService.addMemberField(weixinUnionId, userId, "weixinUnion");
            jUser.id = userId;
        }
        var jResult1 = FreeGetCardUtil.doGiveCard(jUser.id, activityId, "");//给会员绑定券
        if (jResult1.code == "0") {
            out.print("领券成功");
        } else {
            out.print("领券失败,原因：" + jResult1.msg);
        }
    } finally {
        MobileApiService.getPigeon().unlock(lockId);
    }
    // } catch (e) {
    //     $.log(e+"");
    //     out.print(JSON.stringify({code: "99", errorCode: "系统异常，请稍后再试"}));
    // }
})();
