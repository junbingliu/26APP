//#import pigeon.js
//#import Util.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var merchantId = $.params["m"];
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var ret = {state: 'err', msg: '保存成功'};
    var id = $.params['id'] || "";
    var token = $.params['token'] || "";
    var channel = $.params['channel'] || "";
    var state = $.params['state'] || "";
    var sign = $.params['sign'] || "";
    var remark = $.params['remark'] || "";
    var beginTime = $.params['beginTime'] || "";
    var endTime = $.params['endTime'] || "";
    if (!token) {
        ret.msg = "请填写token";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!channel) {
        ret.msg = "请填写channel";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!sign) {
        ret.msg = "请填写sign";
        out.print(JSON.stringify(ret));
        return;
    }
    if(token.length != 32){
        ret.msg = "请输入32位Token";
        out.print(JSON.stringify(ret));
        return;
    }
    if(sign.length != 32){
        ret.msg = "请输入32位密钥";
        out.print(JSON.stringify(ret));
        return;
    }
    if (beginTime) {
        //beginTime = DateUtil.getLongTime(beginTime);
        beginTime = beginTime + " 00:00:00";
    }
    if (endTime) {
        //endTime = DateUtil.getLongTime(endTime + " 23:59:59");
        endTime = endTime + " 23:59:59";
    }
    var api = {
        token: token,
        channel: channel,
        sys: "ole",
        sign: sign,
        state: state == "1",
        beginTime:beginTime,
        endTime:endTime,
        remark: remark
    };
    var result = null;
    if (id) {
        api.id = id;
        result = OpenAPIUtil.updateApiToken(api);
    } else {
        api.state = true;
        result = OpenAPIUtil.addApiToken(api);
    }
    if (result && result.code == "S0A00000") {
        ret.state = "ok";
        ret.msg = "保存成功";
    } else {
        ret.msg = result && result.msg || "保存失败";
    }
    out.print(JSON.stringify(ret));
})();

