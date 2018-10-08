//#import Util.js
//#import jobs.js
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx

(function () {

    var result = {};
    try {
        var doMerchantId = $.params["doMerchantId"];
        var isAll = $.params["isAll"];
        if (!doMerchantId || doMerchantId == "") {
            result.code = "101";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }
        var taskId = OmsEsbProductService.getTaskId(doMerchantId);
        if (taskId) {
            if (JobsApi) {
                //删除之前task
                //JobsService.deleteTask(taskId);
                //因为是加到ERP队列里的，所以是从erp队列删除
                JobsApi.IsoneJobsEngine.omsTaskRunner.deleteTask(taskId);
            }
        }
        var jobPageId = "task/doSendSkuQuantityToOMS.jsx";
        if (isAll && isAll == "Y") {
            jobPageId = "task/doSendSkuQuantityToOMS_bak.jsx";
        }
        var when = (new Date()).getTime();
        var postData = {
            merchantId: doMerchantId
        };
        var jMerchant = MerchantService.getMerchant(doMerchantId);
        if (jMerchant) {
            var sellerType = jMerchant.noversion && jMerchant.noversion.sellerType;//商家类型 如：B2C，CB
            if (sellerType == "O2O" || sellerType == "OLE") {
                jobPageId = "task/doSendO2OSkuQuantityToOMS.jsx";
                if(isAll == "Y"){
                    jobPageId = "task/doSendO2OSkuQuantityToOMS_All.jsx";
                }
            }
        }
        JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);

        result.code = "0";
        result.msg = "对接成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "99";
        result.msg = "对接出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    }

})();





