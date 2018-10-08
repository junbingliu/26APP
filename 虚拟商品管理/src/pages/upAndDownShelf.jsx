//#import Util.js
//#import login.js
//#import merchant.js
//#import open-product.js

(function () {

    var result = {};
    try {
        var productId = $.params.productId;
        var publishState = $.params.publishState;

        if (!productId || !publishState) {
            result.code = "101";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        if (publishState == "0") {
            OpenProductService.updateProductToDown(productId);
        } else if (publishState == "1") {
            OpenProductService.updateProductToUp(productId);
        } else {
            result.code = "102";
            result.msg = "参数非法";
            out.print(JSON.stringify(result));
            return;
        }

        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));

    } catch (e) {
        result.code = "99";
        result.msg = "发生错误: " + e;
        out.print(JSON.stringify(result));
    }

})();