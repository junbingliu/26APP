//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import email.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @server/util/H5CommonUtil.jsx
(function () {

    try {
        var userId = LoginService.getFrontendUserId();
        if (!userId) {
            H5CommonUtil.setLoginErrorResult("请先登录");
            return;
        }
        var start = $.params.start || 0;
        var recordList = OleComplainService.getComplaintList(userId, start, 50);
        for (var i = 0; i < recordList.length; i++) {
            if(recordList[i]){
                recordList[i].formatCreateTime = DateUtil.getLongDate(recordList[i].createTime);
            }

        }
        H5CommonUtil.setSuccessResult(recordList);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试"+e);
    }


})();