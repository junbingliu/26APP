//#import Util.js
//#import login.js
//#import DateUtil.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @server/util/H5CommonUtil.jsx
(function () {

    try {
        var userId = LoginService.getFrontendUserId();
        if (!userId) {
            H5CommonUtil.setLoginErrorResult("请先登录");
            return;
        }
        var id = $.params.id;
        if (!id || id === "") {
            H5CommonUtil.setExceptionResult("参数错误");
            return;
        }
        var record = OleComplainService.getComplaint(id);
        record.formatCreateTime = DateUtil.getLongDate(record.createTime);
        H5CommonUtil.setSuccessResult(record);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试");
    }


})();