//#import ps20.js
//#import Util.js
//#import open-order.js
//#import login.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

;(function () {
    var res = CommonUtil.initRes();
    var loggedUser = LoginService.getFrontendUser();
    var userId = "";
    if (!loggedUser||loggedUser == null) {
        CommonUtil.setErrCode(res, ErrorCode.order.E1M000003);
        return;
    }
    var orderId = $.params.orderId;
    if (!orderId) {
        CommonUtil.setErrCode(res, ErrorCode.order.E1B01001);
        return;
    }
    var lockId = "signOrder_" + orderId;
    lock(lockId);
    try {
        ret = OpenOrderService.signOrder(orderId, "");
        CommonUtil.setRetData(res, ret);
        return;
    } catch (e) {
        CommonUtil.setErrCode(res, ErrorCode.order.E1M01003);
    } finally {
        unlock(lockId);
    }
})();