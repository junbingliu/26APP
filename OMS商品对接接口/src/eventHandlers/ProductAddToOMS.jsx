//#import Util.js
//#import jobs.js
;
(function () {
    var productId = "" + ctx.get("productId");
    var merchantId = "" + ctx.get("merchantId");

    //$.log("\n............................doAddProductToOMS.jsx...begin...productId=" + productId);
    var when = (new Date()).getTime() + 2 * 1000;
    var jobPageId = "task/doUpdateProductToOMS.jsx";
    var postData = {productId: productId, actionType: "productAdd"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("\n............................doAddProductToOMS.jsx...end...productId=" + productId);
})();