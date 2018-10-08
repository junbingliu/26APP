//#import Util.js
//#import login.js
//#import session.js

(function () {
    var Api = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.org.json,
        Packages.net.xinshi.isone.modules.payment.applyimpl
    );

    response.setContentType("application/json");
    var result = {};
    try {
        var mobile = $.params.mobile;
        var jiaJuQuanNo = $.params.jiaJuQuanNo;

        var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!userId) {
            result.state = "err";
            result.msg = "您还未登录";
            out.print(JSON.stringify(result));
            return;
        }
        if (!mobile) {
            result.state = "err";
            result.msg = "手机号码为空";
            out.print(JSON.stringify(result));
            return;
        }
        if (!jiaJuQuanNo) {
            result.state = "err";
            result.msg = "请输入家居券编号";
            out.print(JSON.stringify(result));
            return;
        }

        var jParams = {};
        jParams.couponid = jiaJuQuanNo;
        jParams.phone = mobile;
        var javaParams = $.JSONObject(jParams);
        var checkResult = Api.JiaJuQuanRealPay.checkBalance(javaParams);
        var code = checkResult.optString("code") + "";
        if (code != "0") {
            result.state = "err";
            result.msg = checkResult.optString("msg") + "";
            out.print(JSON.stringify(result));
            return;
        }

        result.state = "ok";
        result.balance = checkResult.optString("value") + "";
        out.print(JSON.stringify(result));
    } catch (e) {
        $.log(e);
        result.state = "err";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }

})();




