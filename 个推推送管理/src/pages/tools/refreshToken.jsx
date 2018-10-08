//#import Util.js
//#import DateUtil.js
//#import $getui:services/GetuiExchangeUtil.jsx
//#import $getui:services/GetuiArgService.jsx

(function () {
    var msgType = $.params['msgType'];
    var jArg = GetuiArgService.getArgs("head_merchant");
    var result = GetuiExchangeUtil.refreshAuthToken(jArg, msgType || GetuiExchangeUtil.msgType.delivery);

    out.print(result + "<br>");
})();