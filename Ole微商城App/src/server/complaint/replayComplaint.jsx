//#import Util.js
//#import login.js
//#import DateUtil.js
//#import user.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @server/util/H5CommonUtil.jsx
(function () {

    try {
        var userId = LoginService.getFrontendUserId();
        if (!userId) {
            H5CommonUtil.setLoginErrorResult("请先登录");
            return;
        }
        var user = UserService.getUser(userId);
        var userName = user.realName || user.nickName;
        var id = $.params.id;
        var content = $.params.content;
        var satisfy = $.params.satisfy;
        if (!id || id === "") {
            H5CommonUtil.setExceptionResult("参数错误");
            return;
        }
        if (!content || content === "") {
            H5CommonUtil.setExceptionResult("参数错误");
            return;
        }
        var record = OleComplainService.getComplaint(id);
        if (!record) {
            H5CommonUtil.setExceptionResult("无该留言记录");
            return;
        }
        var curTime = DateUtil.getLongDate(DateUtil.getNowTime());
        record.formatCreateTime = DateUtil.getLongDate(record.createTime);
        if (satisfy == "yes") {
            record.colseState = "1";
        }
        if (record.chatList) {
            var replay = {};
            replay.creatTime = curTime;
            replay.satisfy = satisfy;
            replay.content = content;
            replay.userName = userName;
            replay.belong = "user";
            record.chatList.push(replay);
        }
        OleComplainService.updateComplaint(record);
        H5CommonUtil.setSuccessResult(record);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试");
    }


})();
