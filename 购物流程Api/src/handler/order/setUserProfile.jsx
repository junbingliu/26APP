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
    var p = $.params.p;
    var v = $.params.v;
    if(p.length>50 || v.length>128){
        return;
    }
    var allowed = ["selectedPayInterfaceId",'idCard'];
    if(allowed.indexOf(p)<0){
        return;
    }
    UserProfileService.setUserInfo(userId,p,v);
    var ret = {
        state:'ok'
    }
    out.print(JSON.stringify(ret));
})();