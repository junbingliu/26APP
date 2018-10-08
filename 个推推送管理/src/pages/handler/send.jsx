//#import Util.js
//#import order.js
//#import $getui:services/GetuiService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx
//#import $ewjEKD:services/UserAdminService.jsx

(function () {
    var orderId = $.params["orderId"];
    var type = $.params["type"];
    var ret = {state: 'err', msg: ''};
    if (!orderId && type != "setTag") {
        ret.msg = "ID不能为空";
        out.print(JSON.stringify(ret));
        return;
    }
    var jOrder = OrderService.getOrderByKey(orderId);
    var postData = {};
    var result = null;
    if (type == 'picking') {
        postData = GetuiExchangeUtil.getPickingPostData(jOrder);
        result = GetuiExchangeUtil.postToGT(postData, "push_app", GetuiExchangeUtil.msgType.picking);
    } else if (type == "delivery") {
        postData = GetuiExchangeUtil.getDeliveryPostData(jOrder);
        result = GetuiExchangeUtil.postToGT(postData, "push_app", GetuiExchangeUtil.msgType.delivery);
    } else if (type == 'setTag') {
        if (orderId) {
            result = GetuiExchangeUtil.setTag(jOrder);
        } else {
            var userAdminList = UserAdminService.getAllUserAdminList(0, -1);
            if (userAdminList.length == 0) {
                result = {};
                result.state = "ok";
                result.returnData = "没有要设置标签的会员";
            } else {
                var successCount = 0;
                for (var i = 0; i < userAdminList.length; i++) {
                    var jUser = userAdminList[i];
                    if (!jUser || !jUser.clientId) {
                        continue;
                    }
                    var result = GetuiExchangeUtil.setTag(jUser);
                    if (result.state == "ok" && result.returnData.result == "ok") {
                        successCount++;
                    }
                }
            }
        }
    }

    ret.state = result.state;
    ret.msg = result.returnData;
    out.print(JSON.stringify(ret));
})();