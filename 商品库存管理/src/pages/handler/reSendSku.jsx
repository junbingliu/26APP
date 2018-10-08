//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import login.js
//#import sku.js
//#import jobs.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx

(function () {
    var ret = {
        state: 'err'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var productIds = $.params["productIds"];
    if (!productIds) {
        ret.msg = "productIds参数错误。";
        out.print(JSON.stringify(ret));
        return;
    }
    var array = productIds.split(",");
    for (var i = 0; i < array.length; i++) {
        var ids = array[i].split(":");
        var jobPageId = "task/doSendOnSkuQuantityToOMS.jsx";
        var when = (new Date()).getTime() + 5*1000;
        var postData = {
            productId: ids[0],
            merchantId: ids[1]
        };
        JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
    }
    ret.state = "ok";
    out.print(JSON.stringify(ret));
})();