//#import Util.js
//#import order.js


(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {


        var orderId = $.params.orderId;
        var order = OrderService.getOrder(orderId);
        var jPayments = Packages.net.xinshi.isone.modules.payment.PaymentHelper.getMerchantThirdPartPayments(orderId);
        var jTempJSON = new Packages.org.json.JSONObject();
        jTempJSON.put("payments",jPayments);
        var paymentJSON = JSON.parse(jTempJSON.toString());
        var payments = paymentJSON.payments;

        $.log(payments.toSource())

        var hasPay119 = false;
        //if(payments.length > 0){
        //    for(var i=0;i<payments.length;i++){
        //        if(payments[i].payInterface.id == "payi_119"){
        //            hasPay119 = true;
        //            break;
        //        }
        //    }
        //}

        setPageDataProperty(pageData, "payments", payments);
        setPageDataProperty(pageData, "paymentCount", payments.length);
        setPageDataProperty(pageData, "orderId", orderId);
        setPageDataProperty(pageData, "order", order);
        setPageDataProperty(pageData, "hasPay119", hasPay119);

    });
})(dataProcessor);