//#import Util.js
//#import product.js
//#import open-product.js
;
(function () {
    try {
        var ret = {state: 'err', msg: ''};
        var productIds = $.params['productIds'];
        if(!productIds ||productIds == ""){
            ret.msg = "productId为空！";
            out.print(JSON.stringify(ret));
            return;
        }
        var temp = productIds.split(",");
        var successNum = 0;
        var failNum = 0;
        for(var o = 0; o < temp.length;o++){
            if(temp[o] != ""){
                var product = ProductService.getProduct(temp[o]);
                var publishState = product.noversion.publishState;
                if(publishState == "0"){
                    successNum++;
                    OpenProductService.updateProductToUp(temp[o]);
                }else {
                    failNum++;
                }

            }
        }
        ret.state = "ok";
        ret.msg = "上架成功的数量为："+successNum+";"+"失败的数量为："+failNum;
        out.print(JSON.stringify(ret));
    }
    catch (e) {
        var msg = "操作出现异常：" + e;
        ret.msg = msg;
        out.print(JSON.stringify(ret));
    }
})();