//#import Util.js
//#import login.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $oleH5Api:services/WxTokenService.jsx

(function () {
    var ret = {
        code: 'E1B040001',
        msg: ""
    };
    try {
        var loginUserId = LoginService.getFrontendUserId();

        if (!loginUserId) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return;
        }
        var value = ps20.getContent("appConfig_ole") + "";
        if (!value) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "系统参数没有配置");
            return;
        }
        value = JSON.parse(value);
        var appId = value && value.data && value.data.wxConfig && value.data.wxConfig.appId || "";
        var secret = value && value.data && value.data.wxConfig && value.data.wxConfig.appSecret || "";
        if (!appId || !secret) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "apppId或appSecret没有配置");
            return;
        }
        var access_token = "";
        var ticket = "";
        var tokenObj = WxTokenService.getUserToken(appId);
        var uerTicket = WxTokenService.getUserTicket(appId);
        // var now = new Date().getTime();
        var now = Math.round(new Date().getTime() / 1000);
        if (!tokenObj || now - Math.floor(tokenObj.expire_time / 1000) >= 0) {
            var tokenUrl = value && value.data && value.data.wxConfig && value.data.wxConfig.tokenUrl || "";
            if (!tokenUrl) {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "tokenUrl没有配置");
                return;
            }
            var jsonMsg = getNetToken(appId, secret, tokenUrl);
            access_token = jsonMsg.access_token;
            if (!access_token) {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "获取access_token失败");
                return;
            }
            var tokenExpires = jsonMsg.expires_in;
            WxTokenService.saveUserToken(appId, access_token, tokenExpires);
        }
        else {
            access_token = tokenObj.accessToken;
        }
        if (!uerTicket || now - Math.floor(uerTicket.expire_time / 1000) >= 0) {
            var jsapi_ticket = getNewTicket(access_token);
            ticket = jsapi_ticket.ticket;
            var expires_in = jsapi_ticket.expires_in;
            WxTokenService.saveUserTicket(appId, ticket, expires_in);
        }
        else {
            ticket = uerTicket.ticket;
        }

        var randomStr = getRanString(8);
        var sha1Str = "jsapi_ticket=" + ticket + "&noncestr=" + randomStr + "&timestamp=" + now + "&url=http://o2otrue.crv.com.cn/ole/wechat/index.html";
        var sha1StrEndcode = SHA2(sha1Str);
        // $.log("===========randomStr========="+randomStr);
        // $.log("===========timestamp========="+now);
        // $.log("===========appId========="+appId);
        // $.log("===========ticket========="+ticket);
        // $.log("===========signature========="+sha1StrEndcode);
        // $.log("===========url========="+"http://wuliu.crvweixin.crv.com.cn");
        ret.code = "S0A00000";
        ret.msg = "获取成功";
        ret.data = {
            appId: appId,
            timestamp: now,
            noncestr: randomStr,
            signature: sha1StrEndcode,
            // ticket:ticket
        };
        out.print(JSON.stringify(ret));
    }
    catch (e) {
        ret.code = "E1M000002";
        ret.msg = "获取失败";
        ret.data = null;
        out.print(JSON.stringify(ret));
    }

})();

function getNewTicket(access_token) {
    var j_ticketUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi";
    var j_ticket = $.get(j_ticketUrl);
    j_ticket = JSON.parse(j_ticket);
    return j_ticket;
}

function getNetToken(appId, secret, tokenUrl) {
    // var getTokenUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + secret;
    var msg = $.get(tokenUrl);
    var data = {
        access_token: msg,
        expires_in: 3600//这里先写3600秒，防止过期，再从云软获取
    };
    return data;
}

function getRanString(len) {
    var str = "";
    var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    for (var i = 0; i < len; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
    }
    return str;
}


function add(x, y) {
    return ((x & 0x7FFFFFFF) + (y & 0x7FFFFFFF)) ^ (x & 0x80000000) ^ (y & 0x80000000);
}

function SHA1hex(num) {
    var sHEXChars = "0123456789abcdef";
    var str = "";
    for (var j = 7; j >= 0; j--)
        str += sHEXChars.charAt((num >> (j * 4)) & 0x0F);
    return str;
}

function AlignSHA1(sIn) {
    var nblk = ((sIn.length + 8) >> 6) + 1,
        blks = new Array(nblk * 16);
    for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
    for (i = 0; i < sIn.length; i++)
        blks[i >> 2] |= sIn.charCodeAt(i) << (24 - (i & 3) * 8);
    blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
    blks[nblk * 16 - 1] = sIn.length * 8;
    return blks;
}

function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
}

function ft(t, b, c, d) {
    if (t < 20) return (b & c) | ((~b) & d);
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}

function kt(t) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
        (t < 60) ? -1894007588 : -899497514;
}

function SHA1(sIn) {
    var x = AlignSHA1(sIn);
    var w = new Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;
    for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for (var j = 0; j < 80; j++) {
            if (j < 16) w[j] = x[i + j];
            else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
        }
        a = add(a, olda);
        b = add(b, oldb);
        c = add(c, oldc);
        d = add(d, oldd);
        e = add(e, olde);
    }
    var SHA1Value = SHA1hex(a) + SHA1hex(b) + SHA1hex(c) + SHA1hex(d) + SHA1hex(e);
    return SHA1Value.toUpperCase();
}

function SHA2(sIn) {
    return SHA1(sIn).toLowerCase();
}



