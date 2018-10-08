//#import Util.js
(function () {
    var merchantId = $.params["m"];
    response.sendRedirect("activity/activityList.jsx?m=" + merchantId);
})();