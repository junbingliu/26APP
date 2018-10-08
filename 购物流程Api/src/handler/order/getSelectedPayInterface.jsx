//#import Util.js
//#import login.js
//#import userProfile.js
//#import session.js


(function () {
    response.setContentType("application/json");
    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    if (!buyerId) {
        var ret = {
            state: 'err',
            msg: "用户不存在"
        };
        out.print(JSON.stringify(ret));
        return;
    }
    var selectedPayInterfaceId = UserProfileService.getUserInfo(userId, "payInterfaceId");
    var ret = {
        state:"ok",
        selectedPayInterfaceId:selectedPayInterfaceId
    }
    out.print(JSON.stringify(ret));
})();
