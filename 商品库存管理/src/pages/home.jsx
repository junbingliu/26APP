//#import Util.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    response.sendRedirect("../home.jsx?m=" + m);
})();