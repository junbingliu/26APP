//#import Util.js
//#import userProfile.js
//#import session.js
//#import user.js
//#import login.js

(function(){
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin"};
        out.print(JSON.stringify(ret));
        return;
    }
    var p = $.params.p;
    var arr = p.split(",");
    var ret= {
        state:"ok"
    }
    arr.forEach(function(param){
        var v = UserProfileService.getUserInfo(userId, param);
        ret[param] = v;
    });

    out.print(JSON.stringify(ret));
})(

);
