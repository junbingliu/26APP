//#import Util.js
//#import jobs.js
//#import product.js

(function () {

    var result = {};
    //try {
        var productId = $.params["productId"];
        var pMerchantId = $.params["pMerchantId"];//商家ID
        var actionType = $.params["actionType"];
        if ((!productId || productId == "") && !pMerchantId) {
            result.code = "101";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        if (!(actionType == "productAdd" ||
            actionType == "productUpdate" ||
            actionType == "productDelete")) {
            result.code = "102";
            result.msg = "actionType参数不合法";
            out.print(JSON.stringify(result));
            return;
        }
        var addToTask = function (pId, actionType) {
            var jobPageId = "task/doUpdateProductToOMS.jsx";
            var when = (new Date()).getTime();
            var postData = {
                productId: pId,
                actionType: actionType
            };
            JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
        };
        var size = 1;
        if (productId) {
            addToTask(productId, actionType);
        } else if (pMerchantId) {
            var pageSize = 100;
            var limit = pageSize;
            var searchArgs = {};
            searchArgs.page = 1;//页码,从1开始
            searchArgs.page_size = pageSize;//每页多少条
            if (pMerchantId && pMerchantId != "head_merchant") {
                searchArgs.merchantId = pMerchantId;
            }
            searchArgs.fields = "productId,name,merchantName,merchantId";

            var result = ProductService.searchProduct(searchArgs);
            var products = result.products;

            for (var i = 0; i < products.length; i++) {
                var product = products[i];
                addToTask(product.productId, actionType);
            }
            var totalRecords = result.total;
            while (totalRecords > limit) {
                searchArgs.page = searchArgs.page + 1;
                searchArgs.page_size = pageSize;//每页多少条
                result = ProductService.searchProduct(searchArgs);
                products = result.products;
                for (var i = 0; i < products.length; i++) {
                    var product = products[i];
                    addToTask(product.productId, actionType);
                }
                limit += products.length;
            }
            size = limit > totalRecords ? totalRecords : limit;
        }
        result.code = "0";
        result.msg = "对接成功,size:" + size;
        out.print(JSON.stringify(result));
    //} catch (e) {
    //    result.code = "99";
    //    result.msg = "对接出现异常，异常信息为：" + e;
    //    out.print(JSON.stringify(result));
    //}

})();