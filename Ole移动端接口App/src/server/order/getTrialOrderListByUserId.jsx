//#import Util.js
//#import search.js
//#import order.js
//#import user.js
//#import login.js
//#import merchant.js
//#import DateUtil.js
//#import product.js
//#import UserUtil.js
//#import returnOrder.js
//#import afterSale.js
//#import DateUtil.js

//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import $oleMobileApi:services/TrialListService.jsx
;
(function () {

    try {

        var userId = $.params["userId"];//用户id
        if (!userId) {
            userId = LoginService.getFrontendUserId();
        }
        Preconditions.checkArgument(userId, "用户没有登录！");

        var orderType = $.params["orderType"] || "tryuse";//订单类型,默认为试用订单
        Preconditions.checkArgument(orderType, "订单类型不能为空！");

        var pageNum = $.params.pageNum || 1;//页码
        var limit = $.params.limit || 20;//每页数量
        var start = (pageNum - 1) * limit;//查询时从何处开始获取

        var qValues = [
            {n: 'buyerId', v: userId, type: 'text', op: "and"},
            {n: 'orderType', v: orderType, type: 'term', op: "and"}
        ];


        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
            type: "ORDER",
            sortFields: [
                {
                    field: "createTime",
                    type: "LONG",
                    reverse: true
                }],
            queryArgs: JSON.stringify({
                mode: 'adv',
                q: qValues.length > 0 ? qValues : null
            })
        };

        var searchResult = SearchService.search(searchArgs);



        var orderListInfo = TrialListService.getOrderList(searchResult);

        var total = orderListInfo.totalRecords;
        var orderList = TrialListService.getShowInfo(orderListInfo.orderList);

        var data = {
            orderList: orderList,
            total: total
        };


        ResponseUtil.success(data);
    } catch (e) {
        out.print(e);
    }


})();