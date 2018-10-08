//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    var appUrl = "pages/setting.jsx?m=" + m;
    response.sendRedirect(appUrl);
})();

