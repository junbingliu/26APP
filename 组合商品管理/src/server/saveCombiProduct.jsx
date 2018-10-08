//#import Util.js
//#import product.js
//#import login.js
//#import $combiproduct:services/CombiProductService.jsx

try {
    var creatorUserId = LoginService.getBackEndLoginUserId();
    var m = $.params.m;
    var combiProductStr = $.params.combiProduct;
    var combiProduct = JSON.parse(combiProductStr);
    combiProduct.ownerUserId = creatorUserId;
    //combiProduct.published = "F";
    //combiProduct.certified = "F";
    combiProduct["parts"].forEach(function (part) {
        if (part) {
            var optionDefault = false;
            part["options"].forEach(function (option) {
                if (!option["skuIds"] || option["skuIds"].length == 0) {
                    var skus = ProductService.getSkusAndAttrs(option.productId);
                    if (skus) {
                        var skuIds = skus.map(function (sku) {
                            if (sku["isHead"] == true) {
                                return sku.id;
                            }
                        });
                        option.skuIds = skuIds;
                    }
                }
                if (option["isDefault"] == true)optionDefault = true;
            });
            if(!optionDefault) {
                var option = part["options"][0];
                option["isDefault"] = true;
            }
        }
    });
    if (!combiProduct.id) {
        var id = CombiProductService.addCombiProduct(combiProduct);
        var ret = {
            state: "ok",
            id: id
        }
    }
    else {
        var old = CombiProductService.getCombiProduct(combiProduct.id);
        var id = combiProduct.id;
        combiProduct.merchantId = old.merchantId;
        if (old.merchantId != m && m != "head_merchant") {
            var ret = {
                state: "err",
                msg: "没有权限。"
            }
        } else {
            combiProduct.lastChangeMerchantId = m;
            $.copy(old, combiProduct);
            CombiProductService.updateCombiProduct(old);
            var ret = {
                state: "ok",
                id: id
            }
        }
    }
    out.print(JSON.stringify(ret));
}
catch (e) {
    var ret = {
        state: "err",
        msg: e
    };
    out.print(JSON.stringify(ret));
}
