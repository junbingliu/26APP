//#import $oleMobileApi:services/BlackListService.jsx

//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
(function () {
    try {
        var id = $.params.id || "";//黑名单序号

        var keyword = $.params.keyword || "";//关键词：活动id

        var userId = $.params.userId || "";//用户id

        var managerId = $.params.managerId || ""; //管理员id

        var productId = $.params.productId || ""; //商品id

        var activityId = $.params.activityId || ""; //活动id

        var orderId = $.params.orderId || "";//订单id

        var reasonCode = $.params.reasonCode || ""; //原因码

        var inReason = $.params.inReason || ""; //加入原因

        var outReason = $.params.outReason || ""; //移除原因

        var beginTime = $.params.beginTime || ""; //开始时间

        var endTime = $.params.endTime || ""; //结束时间

        var pageNum = $.params.pageNum || 1;//页码
        var limit = $.params.limit || 10;//每页数量
        var start = (pageNum - 1) * limit;//查询时从何处开始获取


        var params = {
            id:id,
            keyword:keyword,
            userId: userId,
            managerId: managerId,
            productId:productId,
            activityId:activityId,
            orderId:orderId,
            reasonCode:reasonCode,
            inReason:inReason,
            outReason:outReason,
            beginTime: beginTime,
            endTime: endTime
        };

        var list = BlackListService.get(params, limit, start);
        ResponseUtil.success(list);

    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();