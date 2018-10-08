//#import pigeon.js
//#import Util.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var merchantId = $.params["m"];
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var ret = {state: 'err', msg: '保存成功'};
    var id = $.params['id'] || "";
    var apiId = $.params['apiId'] || "";
    var apiName = $.params['apiName'] || "";
    var apiUrl = $.params['apiUrl'] || "";
    var content = $.params['content'] || "";
    if (!apiId) {
        ret.msg = "请填写APIID";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!apiName) {
        ret.msg = "请填写apiName";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!apiUrl) {
        ret.msg = "请填写apiUrl";
        out.print(JSON.stringify(ret));
        return;
    }
    var api = {
        apiId: apiId,
        apiName: apiName,
        apiUrl: apiUrl,
        content: content,
        apiSys: "ole",
        apiState: 0
    };
    var result = null;
    if (id) {
        api.id = id;
         result = OpenAPIUtil.updateApi(api);
    } else {
        api.apiSys = "ole";
        api.apiState = 0;
        result = OpenAPIUtil.addApi(api);
    }
    if (result && result.code == "S0A00000") {
        ret.state = "ok";
        ret.msg = "保存成功";
    } else {
        ret.msg = result && result.msg || "保存失败";
    }
    out.print(JSON.stringify(ret));
})();

