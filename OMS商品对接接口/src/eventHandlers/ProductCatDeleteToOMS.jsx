//#import Util.js
//#import jobs.js
;
(function () {
    var columnId = "" + ctx.get("columnId");
    var productId = "" + ctx.get("productId");
    var merchantId = "" + ctx.get("merchantId");

    //$.log("............................ProductCatAddToOMS.jsx...begin...columnId=" + columnId);
    var when = (new Date()).getTime() + 2 * 1000;
    var jobPageId = "task/doUpdateProductCatToOMS.jsx";
    var postData = {columnId: columnId, productId: productId, merchantId: merchantId, action: "Delete"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("............................ProductCatAddToOMS.jsx...end...columnId=" + columnId);
})();









