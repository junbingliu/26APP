//#import Util.js
//#import doT.min.js
//#import jobs.js
//#import product.js
//#import open-product.js
(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    response.sendRedirect("setting/index.jsx?m=" + m);
})();
