//#import Util.js
//#import login.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx

(function () {
    var userId = LoginService.getBackEndLoginUserId();

    var merchantId = $.params["merchantId"];
    var id = $.params["id"];
    var ret = {};
    try {

        FreeGetCardService.deleteActivity(id, userId);

        ret.state = "ok";
    } catch (e) {
        ret.state = "error";
        ret.msg = "操作出现异常，请稍后再试";
    }
    out.print(JSON.stringify(ret));
})();