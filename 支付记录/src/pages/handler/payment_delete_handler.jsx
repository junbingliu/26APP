//#import pigeon.js
//#import Util.js
//#import login.js
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
    var id = $.params["id"];
    if (id) {
        var result = PayInterfaceService.delete(id);
        ret.state = "ok";
    }
    out.print(JSON.stringify(ret));
})();