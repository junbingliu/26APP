//#import Util.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
//    response.sendRedirect("/OurHome/modules/payment/PaymentList.jsp?merchantId="+ m + "&columnId=col_m_payment");
    response.sendRedirect("../home.jsx?m=" + m);
})();