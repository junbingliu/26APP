//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/AdminService.jsx

(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.code = "101";
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }

        var merchantId = $.params["m"];
        var userId = $.params["userId"];
        var theMerchantId = $.params["theMerchantId"];
        var adminType = $.params["adminType"];//0:平台，1：区域，2：门店
        if (!userId || !adminType) {
            result.code = "102";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        if (!(adminType === "0" || adminType === "1" || adminType === "2")) {
            result.code = "103";
            result.msg = "管理员类型非法";
            out.print(JSON.stringify(result));
            return;
        }

        if (adminType === "0") {
            theMerchantId = "head_merchant";
        } else {
            if (!theMerchantId) {
                result.code = "104";
                result.msg = "非总部管理员，所属区域或者所属门店ID不能为空";
                out.print(JSON.stringify(result));
                return;
            }
        }

        //添加平台管理员

        var jAdmin = {};
        jAdmin.userId = userId;
        jAdmin.merchantId = theMerchantId;
        jAdmin.adminType = adminType;

        AdminService.addAdmin(adminType, jAdmin, loginUserId);

        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));

    } catch (e) {
        $.log("\n............................e=" + e);
        result.code = "99";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }

})();

