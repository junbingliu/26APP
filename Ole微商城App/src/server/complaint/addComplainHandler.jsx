//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import email.js
//#import merchant.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @server/util/H5CommonUtil.jsx
//#import sysArgument.js
(function () {
    var ret = {};
    try {
        var userId = LoginService.getFrontendUserId();
        if (!userId) {
            H5CommonUtil.setLoginErrorResult("请先登录");
            return;
        }
        var data = $.params.data;
        if (!data || data === "") {
            H5CommonUtil.setExceptionResult("请填写正确的参数");
            return;
        }
        data = JSON.parse(data);
        data.handleState = "待处理";
        data.colseState = "0";
        data.chatList = [];
        var mobile = data.mobile;
        var mobileRegex = new RegExp(SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "regex_Mobile"));

        if (!mobile || mobile == null) {
            ret.code = "E1M000001";
            ret.msg = "收货人手机号不能为空!";
            out.print(JSON.stringify(ret));
            return;
        }
        if (!mobileRegex.test(mobile)) {
            ret.code = "E1M000001";
            ret.msg = "手机号格式不正确。";
            out.print(JSON.stringify(ret));
            return;
        }
        if (!checkNull(data.name) || !checkNull(data.email) || !checkNull(data.content) || !checkNull(data.title) || !checkNull(data.complainType) || !checkNull(data.relevanceMid)) {
            ret.code = "E1M000001";
            ret.msg = "填写正确的内容有误或选择有误";
            out.print(JSON.stringify(ret));
            return;
        }
        if (data.relevanceMid === "root") {
            data.shopName = "微商城";
            var oleMerchantId = H5CommonUtil.getOleMerchantId();
            data.shopEmail = MerchantService.getMerchant(oleMerchantId).email;
        }
        else {
            data.shopEmail = MerchantService.getMerchant(data.relevanceMid).email;

        }
        var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
        if (!reg.test(data.email)) {
            ret.code = "E1M000001";
            ret.msg = "邮箱格式错误";
            out.print(JSON.stringify(ret));
            return;
        }
        var adminEmail = data.shopEmail;
        if (!adminEmail || adminEmail === "") {
            H5CommonUtil.setExceptionResult("该门店暂无管理员邮箱");
            return;
        }

        var id = OleComplainService.addComplaint(data, userId);
        if (id) {
            var bodyMsg = "留言标题" + data.title + "\n留言内容:" + data.content + "\n客服姓名:" + data.name + "\n联系方式:" + data.mobile + "\n电子邮箱" + data.email;
            var email = {
                toEmail: adminEmail,
                subject: "【新留言】" + data.title,
                body: bodyMsg,
                retry: 0,
                loginId: "u_0",
                merchantId: "head_merchant"
            };
            EmailService.sendEmailQue(email);
        }
        ret.id = id;
        H5CommonUtil.setSuccessResult(ret);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试");
    }


})();

function checkNull(data) {
    if (!data || data === "") {
        return false;
    }
    return true;
}