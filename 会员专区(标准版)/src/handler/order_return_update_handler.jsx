//#import Util.js
//#import login.js
//#import user.js

;
(function () {
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.org.apache.commons.lang,
        Packages.net.xinshi.isone.base.ext,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.user,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.java.lang,
        Packages.java.math,
        Packages.java.net,
        Packages.net.xinshi.isone.functions.order,
        Packages.net.xinshi.isone.modules.order.bean,
        Packages.net.xinshi.isone.modules.order.afterservice,
        Packages.net.xinshi.isone.modules.order.afterservice.tools,
        Packages.net.xinshi.isone.modules.order,
        Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
        Packages.net.xinshi.isone.functions.product
    );

    var ret = {
        state: false,
        errorCode: ""
    }
    try {
        //var contextPath = request.getContextPath();
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if (loggedUser != null) {
            userId = loggedUser.id
        } else {
            out.print("notLogin");
            return;
        }

        var deliveryName = request.getParameter("deliveryName");
        var deliveryNo = request.getParameter("deliveryNo");
        var orderType = request.getParameter("orderType");
        var returnOrderId = request.getParameter("returnOrderId");

        var jRefundOrder = selfApi.IsoneOrderEngine.afterService.getOrder(returnOrderId);   //退换货信息
        var returnDeliveryInfo = jRefundOrder.optJSONObject("returnDeliveryInfo");
        if ("returnProduct".equals(orderType)) {
            if (returnDeliveryInfo != null) {
                var oldDeliveryNo = returnDeliveryInfo.optString("deliveryNo");
                var oldDeliveryName = returnDeliveryInfo.optString("deliveryName");
                //如果之前已经有保存，并且值没有改变，就直接返回ok
                if (selfApi.StringUtils.equals(oldDeliveryNo, deliveryNo) && selfApi.StringUtils.equals(deliveryName, oldDeliveryName)) {
                    out.print("ok");
                    return;
                }
            }
            returnDeliveryInfo.put("deliveryNo", deliveryNo);
            returnDeliveryInfo.put("deliveryName", deliveryName);
        } else {
            var deliveryInfo = returnDeliveryInfo.optJSONObject("inStore");
            if (deliveryInfo != null) {
                var oldDeliveryNo = deliveryInfo.optString("deliveryNo");
                var oldDeliveryName = deliveryInfo.optString("deliveryName");
                //如果之前已经有保存，并且值没有改变，就直接返回ok
                if (selfApi.StringUtils.equals(oldDeliveryNo, deliveryNo) && selfApi.StringUtils.equals(deliveryName, oldDeliveryName)) {
                    out.print("ok");
                    return;
                }
            }
            deliveryInfo.put("deliveryNo", deliveryNo);
            deliveryInfo.put("deliveryName", deliveryName);

        }
        selfApi.IsoneOrderEngine.afterService.updateOrder(returnOrderId, jRefundOrder);
        //审批事件
        try {
            var jUser = selfApi.IsoneModulesEngine.userService.getUser(userId);
            var afterOrderEventMaps = new selfApi.ConcurrentHashMapExt();
            afterOrderEventMaps.put("order_id", returnOrderId);
            afterOrderEventMaps.put("order_object", jRefundOrder);
            afterOrderEventMaps.put("userId", selfApi.StringUtils.isBlank(userId) ? "u_0" : userId);
            afterOrderEventMaps.put("userName", selfApi.UserUtil.getRealName(jUser));
            afterOrderEventMaps.put("order_update_time", selfApi.String.valueOf(selfApi.System.currentTimeMillis()));
            afterOrderEventMaps.put("order_update_ip", selfApi.OrderHelper.getLocalIP());
            selfApi.AfterSaleEventBusUtils.doUpdateAfterOrderCertifyStateEvents(selfApi.AfterOrderEventName.afterOrderCertifyStateEvent.name(), afterOrderEventMaps);
        } catch (e) {

            $.log(e);
        }
        out.print("ok");
    } catch (e) {
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(ret.errorCode);
        $.log(e)
    }
})();