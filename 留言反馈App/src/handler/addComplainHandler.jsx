//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import email.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @handler/H5CommonUtil.jsx
(function () {

    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            H5CommonUtil.setExceptionResult("请先登录");
            return;
        }
        var data = $.params.data;
        if (!data || data === "") {
            H5CommonUtil.setExceptionResult("请填写正确的参数");
            return;
        }
        data = JSON.parse(data);
        var adminEmail = data.shopEmail;
        if (!adminEmail || adminEmail === "") {
            H5CommonUtil.setExceptionResult("请填写正确的参数");
            return;
        }
        var objName = userId;
        var id = OleComplainService.addComplaint(data, userId);
        if (id) {
            var email = {
                toEmail: adminEmail,
                subject: "任务队列监控通知-" + objName,
                body: "您收到一条新反馈",
                retry: 0,
                loginId: "u_0",
                merchantId: "head_merchant"
            };
            EmailService.sendEmailQue(email);
        }
        var ret = {};
        ret.id = id;
        H5CommonUtil.setSuccessResult(ret);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试");
    }


})();