//#import Util.js
//#import order.js
//#import payment.js
//#import template-native.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import realPayRec.js
//#import login.js

;(function() {
    var realPayRecId = $.params["realPayRecId"];
    var realPayRec = RealPayRecordService.getPayRec(realPayRecId);
    if(!realPayRec){
        var pageData = {
            state : 'err',
            msg:"找不到支付记录。"
        };
        var templateSource = $.getProgram(appMd5,"pages/addOrderErr.html");
        var pageFn = template.compile(templateSource);
        out.print(pageFn(pageData));
        return;
    }
    var payHtml = PaymentService.getPayHtml(realPayRec);
    var templateSource = $.getProgram(appMd5,"pages/payHandler.html");
    var pageFn = template.compile(templateSource);
    var pageData = {
        payHtml:payHtml
    };
    var html = pageFn(pageData);
    out.print(html);
})();