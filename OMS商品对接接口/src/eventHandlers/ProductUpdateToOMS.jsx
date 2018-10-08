//#import Util.js
//#import jobs.js
;
(function () {
    var productId = "" + ctx.get("productId");
    var merchantId = "" + ctx.get("merchantId");

    //$.log("\n............................ProductUpdateToOMS.jsx...begin...productId=" + productId);
    var when = (new Date()).getTime() + 2 * 1000;
    var jobPageId = "task/doUpdateProductToOMS.jsx";
    var postData = {productId: productId, actionType: "productUpdate"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("\n............................ProductUpdateToOMS.jsx...end...productId=" + productId);
})();









