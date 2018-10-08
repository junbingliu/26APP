//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import OrderUtil.js

(function () {


    // var afterSaleOrderList = ReturnOrderService.getAfterSaleOrderList("m_50000", "u_50000","1","40") + "";
    // var result = AfterSaleService.getRefundOrders( "u_50000","1","40");

    var orderId = $.params.orderId;
    var result = OrderUtilService.getRefundState(orderId);
    $.log("result=="+result);
    out.print(JSON.stringify(result));
    // $.log("afterSaleOrderList" + afterSaleOrderList)
    // out.print(afterSaleOrderList);
})();