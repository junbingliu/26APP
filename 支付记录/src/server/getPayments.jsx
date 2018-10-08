//#import Util.js
//#import payment.js
var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType("head_merchant","common");
var ret={
    state:"ok",
    payments:payments
}
out.print(JSON.stringify(ret));