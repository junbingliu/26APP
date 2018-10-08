//#import Util.js
//#import login.js
//#import user.js
//#import order.js
//#import $IDCardLib:services/IDCardLibService.jsx

;(function () {
    var result = {};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "101";
            result.msg = "请先登录";
            return;
        }

        var idCardId = $.params.idCardId;
        var idCardFrontPicFileId = $.params.idCardFrontPicFileId;
        var idCardBackPicFileId = $.params.idCardBackPicFileId;
        if (!idCardId || idCardId == "" || !idCardFrontPicFileId || idCardFrontPicFileId == "" || !idCardBackPicFileId || idCardBackPicFileId == "") {
            result.code = "102";
            result.msg = "参数错误";
            return;
        }

        var jRecord = IDCardLibService.getIdCard(idCardId);
        if (!jRecord) {
            result.code = "103";
            result.msg = "订单不存在";
            return;
        }

        var idCardFrontPic = jRecord.idCardFrontPic;
        var idCardBackPic = jRecord.idCardBackPic;

        if (idCardFrontPic == idCardFrontPicFileId && idCardBackPic == idCardBackPicFileId) {
            result.code = "104";
            result.msg = "保存终止，原因是：没有做任何修改";
            return;
        }

        jRecord.idCardFrontPic = idCardFrontPicFileId;
        jRecord.idCardBackPic = idCardBackPicFileId;
        jRecord.newIdCardFrontPic = "";
        jRecord.newIdCardBackPic = "";

        IDCardLibService.updateIdCard(jRecord);
        result.code = "0";
        result.msg = "保存成功";
    }
    catch (e) {
        result.code = "99";
        result.msg = "操作出现异常：" + e;
    } finally {
        var data = JSON.stringify(result);
        out.print(data);
    }
})();