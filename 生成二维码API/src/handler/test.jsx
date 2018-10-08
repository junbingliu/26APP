//#import Util.js
//#import base64.js
//#import template-native.js

;(function () {
    var qCode = "http://wechat.demo.com/#/integralMall?_k=pazce4";

    var url = Base64.encode(qCode);
    response.sendRedirect("/commonQRCodeApi/handler/commonQRCode.jsx?s=" + url);

})();

