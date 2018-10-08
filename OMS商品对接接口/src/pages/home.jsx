//#import Util.js
(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    response.sendRedirect("merchant_list.jsx?m=" + m)
})();

