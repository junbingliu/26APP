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

    var jUser = UserService.getUser(userId);

    var ret = {
        state:"ok",
        userId:jUser.id,
        userMobile:jUser.mobilPhone || ""
    };

    out.print(JSON.stringify(ret));
})();