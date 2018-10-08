//#import Util.js
//#import jobs.js
;
(function () {
    var columnId = "" + ctx.get("columnId");
    var productId = "" + ctx.get("productId");
    var merchantId = "" + ctx.get("merchantId");

    //是商品主分类时，不用对接，因为增加商品一定是最后一级分类，这个是多触发的事件
    if (columnId == "c_10000") {
        return;
    }
    //$.log("............................ProductCatAddToOMS.jsx...begin...columnId=" + columnId);
    var when = (new Date()).getTime() + 30 * 1000;
    var jobPageId = "task/doUpdateProductCatToOMS.jsx";
    var postData = {columnId: columnId, productId: productId, merchantId: merchantId, action: "Create"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("............................ProductCatAddToOMS.jsx...end...columnId=" + columnId);
})();









