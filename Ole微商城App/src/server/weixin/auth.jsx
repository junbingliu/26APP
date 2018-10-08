//#import Util.js
//#import login.js
//#import user.js
//#import DESEncryptUtil.js
//#import @server/util/H5CommonUtil.jsx
//#import @server/util/ErrorCode.jsx

/**
 * 微信授权登录的接口，用于电子礼品卡对接
 */
(function () {
    try {
        var userId = LoginService.getFrontendUserId(); // 用户id
        if (!userId) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return;
        }
        var jUser = UserService.getUser(userId);
        if (!jUser) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return;
        }
        var jData = {
            openid: jUser.oleWxOpenId,
            nickname: jUser.nickName,
            headimgurl: jUser.logo,
            sex: jUser.gender,
        };
        var getRanString = function (len) {
            var str = "";
            var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

            for (var i = 0; i < len; i++) {
                var pos = Math.round(Math.random() * (arr.length - 1));
                str += arr[pos];
            }
            return str;
        };
        var iv = getRanString(8);

        var key = 'XINGYUN_OLE_ceCgY1*#JGaJh';

        //进行des加密
        var encStr = DESEncryptUtil.encSign(key, iv, JSON.stringify(jData));
        //跳转到银商的连接
        var redirectUrl = "https://vpay.upcard.com.cn/vcweixin/ole/gotoolemenu?company=ole&xy=" + encStr + "&iv=" + iv;
        response.sendRedirect(redirectUrl);
    } catch (e) {
        $.log(e + "");
        out.print(JSON.stringify({code: "99", errorCode: "系统异常，请稍后再试"}));
    }
})();
