//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/StoreService.jsx


(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.status = 404;
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }

        var obj = StoreService.getStore($.params.id);
        obj.status = $.params.status;
        StoreService.updateStore(obj);

        result.status = 200;
        out.print(JSON.stringify(result));
    }catch (e) {
        result.status = 500;
        result.msg = e;
        out.print(JSON.stringify(result));
    }


})();

