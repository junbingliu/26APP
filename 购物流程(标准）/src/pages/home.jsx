//#import Util.js
(function(){
    var m = $.params['m'];
    if(!m){
        m=$.getDefaultMerchantId();
    }
    response.sendRedirect("/appEditor/pages/listPages.jsx?m=" + m + "&rappId=" + appId);
})();

