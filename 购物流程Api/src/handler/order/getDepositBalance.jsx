//#import Util.js
//#import account.js
//#import session.js
//#import login.js
//#import user.js
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

(function(){
    response.setContentType("application/json");
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin"};
        out.print(JSON.stringify(ret));
        return;
    }

    var serverTime = new Date().getTime();
    var jUser = UserService.getUser(userId);

    var depositBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "eWallet");
    var integralBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "shoppingIntegral");
    var jArgs = PreDepositRuleSettingService.getArgs();
    if (!jArgs) {
        jArgs = {};
    }

    var recordList = [];
    var columnIds = jArgs.columnIds;
    if (columnIds && columnIds != "") {
        var cIds = columnIds.split(",");
        for (var i = 0; i < cIds.length; i++) {
            var cid = cIds[i];
            recordList.push(cid);
        }
    }

    if (recordList.length > 0) {
        //当设置了预存款使用规则，则判断用户的预存款有效期
        var preDepositRuleBeginTime = 0;
        var preDepositRuleEndTime = 0;
        if (jUser.preDepositRuleBeginTime) {
            preDepositRuleBeginTime = Number(jUser.preDepositRuleBeginTime);
        }
        if (jUser.preDepositRuleEndTime) {
            preDepositRuleEndTime = Number(jUser.preDepositRuleEndTime);
        }

        if (!(preDepositRuleBeginTime < serverTime && serverTime < preDepositRuleEndTime)) {
            //当不在有效期内则把可用预存款设置为0
            depositBalance = "0";
        }
    }

    var ret = {
        state:"ok",
        appliedColumnIds:recordList,
        balance:depositBalance,
        integralBalance:integralBalance
    };

    out.print(JSON.stringify(ret));
})();