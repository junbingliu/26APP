//#import Util.js
//#import login.js
//#import userProfile.js
//#import session.js

;(function() {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin."};
        out.print(JSON.stringify(ret));
        return;
    }
    var selectedPayInterfaceId = $.params.selectedPayInterfaceId;
    UserProfileService.setUserInfo(userId,"payInterfaceId",selectedPayInterfaceId);
    var ret = {
        state:'ok'
    }
    out.print(JSON.stringify(ret));
})();