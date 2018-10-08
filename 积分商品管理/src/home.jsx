//#import Util.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    response.sendRedirect("pages/product_list.jsx?m=" + m);
})();