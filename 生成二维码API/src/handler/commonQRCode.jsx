//#import Util.js
//#import base64.js
//#import template-native.js

;(function () {
    var qCode = $.params.s;
    if(!qCode){
        out.print("参数错误");
        return;
    }

    var url = Base64.decode(qCode, "");

    $.log("\n.........................url="+url);
    var templateSource = $.getProgram(appMd5, "handler/commonQRCode.html");
    var pageFn = template.compile(templateSource);
    var pageData = {
        qCode: qCode
    };
    var html = pageFn(url);
    out.print(html);

})();

