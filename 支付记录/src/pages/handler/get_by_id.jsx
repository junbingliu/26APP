//#import Util.js
//#import realPayRec.js
//#import login.js

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
        var result = RealPayRecordService.getPayRec(id);
        if (result) {
            ret.state = "ok";
            ret.data = result;
        } else {
            ret.msg = "查询ID是" + id + "的支付记录失败!";
        }
    }
    out.print(JSON.stringify(ret));
})();