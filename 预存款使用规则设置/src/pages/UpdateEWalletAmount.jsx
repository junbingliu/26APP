//#import Util.js
//#import login.js
//#import user.js
//#import account.js

;
(function () {
    var result = {};
    try {

        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            result.code = "101";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        var userId = $.params["userId"];
        var eWalletAmount = $.params["eWalletAmount"];
        var fillReason = $.params["fillReason"];

        var jUser = UserService.getUser(userId);
        if (!jUser) {
            result.code = "102";
            result.msg = "用户不存在";
            out.print(JSON.stringify(result));
            return;
        }

        if (!eWalletAmount || eWalletAmount == "") {
            result.code = "103";
            result.msg = "充值金额不能为空";
            out.print(JSON.stringify(result));
            return;
        }

        if (!fillReason || fillReason == "") {
            result.code = "104";
            result.msg = "充值说明不能为空";
            out.print(JSON.stringify(result));
            return;
        }

        //objId, merchantId, accountType, amount, transactionReason, operateUserId, objTypeId, transactionType
        var amount = Number(Number(eWalletAmount) * 100);
        var merchantId = "head_merchant";
        var accountType = "eWallet";
        var objTypeId = "objType_user";
        var transactionType = "transationType_recharge";

        var isOk = AccountService.updateAccount(userId, merchantId, accountType, amount, fillReason, loginUserId, objTypeId, transactionType);
        if (isOk) {
            result.code = "0";
            result.msg = "保存成功";
        } else {
            result.code = "110";
            result.msg = "修改出现异常，请与管理员联系";
        }
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
