//#import Util.js
//#import search.js
//#import $oleMobileApi:services/OrderAppraiseService.jsx

/**
 * 订单评价添加索引
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function () {
    $.log("\n\n OrderAppraiseIndex begin: \n\n");
    if (!ids) {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    idArray.forEach(function(id) {
        var orderAppraise = OrderAppraiseService.getObject(id);
        if (orderAppraise) {
            var indexObject = {};
            indexObject.id = id;
            indexObject.orderId = orderAppraise.orderId; // 订单ID
            indexObject.userId = orderAppraise.userId; // 评价人ID
            indexObject.satisfaction = orderAppraise.satisfaction; // 满意度
            indexObject.createDate = orderAppraise.createDate; // 满意度
            indexObject.ot = "ole_order_appraise_ot_index";
            docs.push(indexObject)
        }
    });
    SearchService.index(docs, ids);
    $.log("\n\n OrderAppraiseIndex end: \n\n");
})();