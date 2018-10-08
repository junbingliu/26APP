//#import Util.js
//#import login.js
//#import @server/util/ErrorCode.jsx

(function () {
    //这个是退出登录的接口
    var ret = ErrorCode.S0A00000;
    LoginService.logoutFrontend();
    out.print(JSON.stringify(ret));
})();