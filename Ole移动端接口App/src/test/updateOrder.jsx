//#import Util.js
//#import order.js
//#import login.js
//#import delMerchant.js
//#import @server/util/CommonUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    try {
        var orderAliasCode = $.params.orderAliasCode;
        var delMerchantColumnId = "dm_60000"; //顺丰快递
        var PlatformDelMerchant = DelMerchantService.getPlatformDelMerchant(delMerchantColumnId);

        var order = OrderService.getOrderByAliasCode(orderAliasCode);
        var userId = "u_0";
        if (!order) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1B00001);
            return;
        }

        if (!PlatformDelMerchant) {
            CommonUtil.setErrCode(res, ErrorCode.sfExchange.E1C00001);
            return;
        }

        var jLogisticsInfo = {
            billNo: "2222222",
            delMerchantName: PlatformDelMerchant.delMerchantName || "",
            delMerchantColumnId: delMerchantColumnId,
            state: "0"     //0：已下单 未确认 1：已确认 2：已取消
        };
        // order.logisticsInfo = CommonUtil.copyParams(jLogisticsInfo, order.logisticsInfo);
        // order.logisticsInfo = CommonUtil.resetParams(jLogisticsInfo, order.logisticsInfo);
        order.logisticsInfo = jLogisticsInfo;

        $.log("order.logisticsInfo===" + JSON.stringify(order.logisticsInfo));
        var updateResult = OrderService.updateOrder(order.id, order, userId);
        $.log("updataResult===" + updateResult);
        out.print(updateResult);

    } catch (e) {
        $.log(e);
    }
})();