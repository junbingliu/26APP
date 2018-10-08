//#import pigeon.js
//#import Util.js
//#import login.js
//#import DateUtil.js
//#import $realPayRec:libs/PaymentService.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var appStr = $.params["appStr"];
    var param = JSON.parse(appStr);
    if (!param.name || param.name.trim() == "") {
        ret.msg = "支付方式名称不能为空。";
        out.print(JSON.stringify(ret));
        return
    }
    var id = PayInterfaceService.add(param);
    ret.state = "ok";
    if (!id) {
        ret.state = "no";
        ret.msg = "添加失败,请稍候重试!";
    }
    out.print(JSON.stringify(ret));
})();