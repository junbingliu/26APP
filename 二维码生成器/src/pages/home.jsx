//#import Util.js

(function () {
    var merchantId = $.params["m"];
    response.sendRedirect("commonQRCodeCreator.jsx?m=" + merchantId);
})();

