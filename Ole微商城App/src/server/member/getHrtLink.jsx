//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $hrt_exchange:services/HRTLogService.jsx
//#import $hrt_exchange:services/HRTArgService.jsx
//#import $hrt_exchange:services/HRTExchangeUtil.jsx

/**
 * 获取积分商城华润通对接的连接地址
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var memberId = jUser.memberid;//会员id
    if (!memberId || memberId == "0") {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000002, '', "该会员没有绑定会员卡");
        return
    }
    var merchantId = H5CommonUtil.getOleMerchantId();//商家id
    var data = {
        "merchantId": merchantId,
        "deviceChannel": "WECHAT",
        "businessChannel": "CROLE",
        "memberId": memberId
    };
    var ret = HRTExchangeUtil.postToHRT(data, "createToken");//获取用户的token
    if (ret.state == "ok") {
        var returnData = ret.returnData;
        var token = returnData.RETURN_DATA.token;//会员token
        //积分兑换
        var duihuanUrl = "https://cloud.huaruntong.cn/web/m/crvwechat/index.html?#/thirdAuth?redirectUri=" +
            "https%3A%2F%2Fcloud.huaruntong.cn%2Fweb%2Fm%2F%3Fe%3D%26from%3Dgroupmessage%26isappinstalled%3D0%23%2FautoPage%3Fid%3Dpage_390%26utm_source%3Dole%26utm_campaign%3Dolepqzx&authToken=" + token;
        //积分互通
        var hutongUrl = "https://cloud.huaruntong.cn/web/m/crvwechat/index.html?#/thirdAuth?redirectUri=" +
            "https%3A%2F%2Fcloud.huaruntong.cn%2Fweb%2Fintergration%2F%23%2Fexchangelist%3FshareId%3Dole&authToken=" + token;
        //充值缴费
        var jiaofeiUrl = "https://cloud.huaruntong.cn/web/m/crvwechat/index.html?#/thirdAuth?redirectUri=" +
            "https%3A%2F%2Fcloud.huaruntong.cn%2Fweb%2Fintergration%2F%3Ffrom%3Dgroupmessage%23%2Finter%2Frecharge%3Ftype%3Dbill%26shareId%3Dole%26utm_source%3Dole%26utm_campaign%3Dgzhcz&authToken=" + token;
        var data = {
            duihuanUrl: duihuanUrl,
            hutongUrl: hutongUrl,
            jiaofeiUrl: jiaofeiUrl
        };
        H5CommonUtil.setSuccessResult(data);
    } else {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000002, '', ret.msg);
    }
})();