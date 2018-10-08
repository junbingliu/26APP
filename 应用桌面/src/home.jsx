//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    if(!m){
        m=$.getDefaultMerchantId();
    }
    var appUrl = "index.jsx?m=" + m;
    response.sendRedirect(appUrl);
})();

