//#import util.js
//#import realPayRec.js
//#import order.js
//#import login.js

(function(){
    var orderIds = $.params.orderIds;
    var arr = orderIds.split(",");
    var effectivePayRecId = null;
    var uid = LoginService.getFrontendUserId();
    for(var i=0; i<arr.length; i++) {
        var orderId = arr[i];
        var order = OrderService.getOrder(orderId);
        if(order.buyerInfo.userId!=uid){
            return;
        }
        //获得这个order的所有realPayRecId
        var payRecs = order.payRecs;
        for (var j in payRecs) {
            var payRec = payRecs[j];
            if ( payRec.realPayRecId && payRec.state == '4') {
                ret = {
                    state: "ok",
                    payState: "unpaid",
                    msg: "我们还没有收到您的付款，请再次支付或者稍后在查询是否已经到帐,谢谢！",
                    payRec:payRec
                }
                out.print(JSON.stringify(ret));
                return;
            }
        }
    }
    ret = {
        state: "ok",
        payState: "paid"
    }
    out.print(JSON.stringify(ret));
    return;

})();

