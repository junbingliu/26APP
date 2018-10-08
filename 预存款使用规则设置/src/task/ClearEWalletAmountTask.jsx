//#import Util.js
//#import user.js
//#import account.js

;
(function () {
    try {

        var jUser = UserService.getUser(userId);
        if (!jUser) {
            return;
        }

        var eWalletAmount = UserService.getUserEWalletMoneyAmount(userId);
        if (!eWalletAmount) {
            eWalletAmount = 0;
        }

        if (eWalletAmount == 0) {
            $.log("\n...............................ClearEWalletAmountTask.jsx...............eWalletAmount=0");
            return;
        }

        var curTime = new Date().getTime();
        var preDepositRuleEndTime = jUser.preDepositRuleEndTime;
        if(!preDepositRuleEndTime || Number(preDepositRuleEndTime) > curTime){
            return;
        }


        //objId, merchantId, accountType, amount, transactionReason, operateUserId, objTypeId, transactionType
        var amount = 0 - eWalletAmount;
        var merchantId = "head_merchant";
        var accountType = "eWallet";
        var objTypeId = "objType_user";
        var transactionType = "transationType_recharge";
        var fillReason = "预存款到期自动清0";
        var loginUserId = "u_sys";

        var isOk = AccountService.updateAccount(userId, merchantId, accountType, amount, fillReason, loginUserId, objTypeId, transactionType);
        $.log("\n...............................ClearEWalletAmountTask.jsx...............end");
    }
    catch (e) {
        $.log("e=" + e);
    }
})();
