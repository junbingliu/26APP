//#import Util.js
//#import artTemplate.js
(function(){
    var m = $.params['m'];
    if(!m){
        m = $.getDefaultMerchantId();
    }
    response.sendRedirect("about.jsx?m=" + m);
})();

