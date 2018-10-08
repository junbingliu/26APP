//#import pigeon.js
//#import Util.js
//#import $openAPIManage:services/OpenAPIConfigService.jsx

(function () {
    var merchantId = $.params["m"];
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var url = $.params['url'];
    var token = $.params['token'];
    var config = {
        url: url,
        token: token
    };
    OpenAPIConfigService.save(config);
    var ret = {state:'ok',msg:'保存成功'};
    out.print(JSON.stringify(ret));
})();

