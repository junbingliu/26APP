//#import Util.js
//#import login.js
//#import merchant.js
//#import $oleMemberClassSetting:services/StoreService.jsx
(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.status = 404;
            result.msg = "您还未登录,请先登录";
            return;
        }






        result.status = 200;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = 500;
        result.msg = e;
        out.print(JSON.stringify(result));
    }
})();

