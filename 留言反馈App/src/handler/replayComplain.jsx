//#import Util.js
//#import login.js
//#import DateUtil.js
//#import user.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @handler/H5CommonUtil.jsx
//#import NoticeTrigger.js
(function () {

    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            H5CommonUtil.setLoginErrorResult("请先登录");
            return;
        }

        var id = $.params.id;
        var content = $.params.content;
        $.log("============id======"+id);
        $.log("============content======"+content);
        if (!id || id === "") {
            H5CommonUtil.setExceptionResult("参数错误");
            return;
        }
        if (!content || content === "") {
            H5CommonUtil.setExceptionResult("参数错误");
            return;
        }
        var record = OleComplainService.getComplaint(id);
        record.handleState="已回复";
        if (!record) {
            H5CommonUtil.setExceptionResult("无该留言记录");
            return;
        }
        var shopName = record.shopName;
        var curTime = DateUtil.getLongDate(DateUtil.getNowTime());
        record.formatCreateTime = DateUtil.getLongDate(record.createTime);
        if (record.chatList) {
            var replay = {};
            replay.creatTime = curTime;
            replay.content = content;
            replay.shopName = shopName;
            replay.belong = "merchant";
            record.chatList.push(replay);
        }
        OleComplainService.updateComplaint(record);
        var noticeId = "notice_57100";
        var jLabel = {};
        jLabel["\\[message:title\\]"] = "意见反馈结果通知";
        jLabel["\\[message:shopName\\]"] = shopName;
        jLabel["\\[message:content\\]"] = record.content;
        jLabel["\\[message:replyContent\\]"] = content;

        NoticeTriggerService.send(record.createUserId, noticeId, "head_merchant", jLabel);//留言回复通知
        H5CommonUtil.setSuccessResult(record);
    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常，请稍候重试"+e);
    }


})();
