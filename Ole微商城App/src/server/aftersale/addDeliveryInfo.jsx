//#import Util.js
//#import open-afterSale.js
//#import afterSale.js
//#import delMerchant.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {
    var res = CommonUtil.initRes();

    var returnOrderId = $.params.returnOrderId;
    var logisticName = $.params.logisticName;
    var waybill = $.params.waybill;
    var returnFreight = $.params.returnFreight||"";//运费
    var returnShipmentTime = $.params.returnShipmentTime||"";//客户寄回的发货时间戳
    var waybill = $.params.waybill;
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000003);
        return;
    }
    if (!returnOrderId) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00008);
        return;
    }
    if (!logisticName) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00010);
        return;
    }
    if (!waybill) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00009);
        return;
    }
    var jOrder = AfterSaleService.getOrderByAliasCode(returnOrderId);
    if (!jOrder) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00001);
        return;
    }
    if (logisticName.indexOf("pdm") > -1) {
        var delMerchant = DelMerchantService.getDelMerchant(logisticName);
        if (delMerchant) {
            logisticName = delMerchant.deliveryMerchantName;
        }
    }

    var jResult = OpenAfterSaleService.updateReturnOrderReturnDeliveryInfoEx(jOrder.id, logisticName, waybill, loginUserId,returnFreight, returnShipmentTime);
    var data = {};
    if (jResult && jResult.code && jResult.code == "0") {
        data = jResult;
        CommonUtil.setRetData(res, data);
    } else {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00006, jResult.msg);
    }
})();