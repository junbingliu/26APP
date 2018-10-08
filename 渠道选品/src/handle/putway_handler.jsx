//#import Util.js
//#import open-product.js
;
(function () {
    try {
        var ret = {state: 'err', msg: ''};
        var productId = $.params['productId'];
        if(!productId ||productId == ""){
            ret.msg = "productId为空！";
            out.print(JSON.stringify(ret));
            return;
        }
        OpenProductService.updateProductToUp(productId);
        ret.state = "ok";
        out.print(JSON.stringify(ret));
    }
    catch (e) {
        var msg = "操作出现异常：" + e;
        ret.msg = msg;
        out.print(JSON.stringify(ret));
    }
})();