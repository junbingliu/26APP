//#import Util.js
//#import login.js
var user = LoginService.getFrontendUser();
if(user) {
    var ret = {
        state: "ok",
        loginId: user.loginId,
        loginUserId: user.id
    }
    out.print(JSON.stringify(ret));
}
else{
    var ret = {
        state: "noLogin",
        loginId: "-1",
        loginUserId: "-1"
    }
    out.print(JSON.stringify(ret));
}
