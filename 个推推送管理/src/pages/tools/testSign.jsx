//#import artTemplate.js
//#import login.js
//#import Util.js
//#import $hrt_exchange:services/HRTArgService.jsx
//#import $hrt_exchange:services/HRTExchangeUtil.jsx


(function () {
    var data = $.params['data'];
    var merchantId = $.params['merchantId'];
    var msg = '';

    if (!data) {
        msg = "请输入报文";
    } else {
        var jArgs = HRTArgService.getArgs(merchantId);
        var sign = jArgs.sign;
        sign = "&" + sign;
        data = JSON.parse(data);
        msg = HRTExchangeUtil.getSign(data, sign);
        data = JSON.stringify(data);
    }
    var source = $.getProgram(appMd5, "pages/tools/testSign.jsxp");
    var pageData = {
        msg: msg,
        data: data,
        merchantId: merchantId
    };
    var render = template.compile(source);
    out.print(render(pageData));
})();