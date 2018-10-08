//#import artTemplate.js
//#import pigeon.js
//#import Util.js
(function () {
    var m = $.params['m'];
    if(!m){
        m=$.getDefaultMerchantId();
    }
    var appUrl = "backend/preSale_rule_list.jsx?m=" + m;
    response.sendRedirect(appUrl);
})();

