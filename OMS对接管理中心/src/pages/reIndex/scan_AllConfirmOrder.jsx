(function () {
//#import Util.js
//#import open-order.js
//#import search.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbControlCenter:services/OmsLogQuery.jsx

    //作用，扫面m_100所有已确认的订单的日志对接数量
    try {
        var searchArgs = {
            page: "1",
            page_size: "100",
            merchantId: "m_100",
            //payState: "p200",//待支付
            processState: "p101",//待审核
            fields: "orderId,orderAliasCode,createTime"
        };
        var searchResult = OpenOrderService.getOrders(searchArgs);
        if (searchResult.code != "0") {
            out.print("获取订单出现异常：" + searchResult.msg);
            return;
        }

        var total = 0;
        var totalError = 0;
        var orders = searchResult.orders;
        for (var i = 0; i < orders.length; i++) {
            total++;
            var jOrder = orders[i];
            var orderAliasCode = jOrder.orderAliasCode;

            var searchParams = {};
            searchParams.keyword = orderAliasCode;
            var searchLogArgs = {
                fetchCount: 1,
                fromPath: 0
            };
            searchArgs.sortFields = [{
                field: "createTime",
                type: 'LONG',
                reverse: true
            }];

            searchLogArgs.queryArgs = OmsLogQuery.getQueryArgs(searchParams);
            var result = SearchService.search(searchLogArgs);
            var totalRecords = 0;
            if(result.searchResult){
                totalRecords = result.searchResult.getTotal();
            }
            out.print("<br>orderAliasCode=" + orderAliasCode);
            out.print("....totalRecords=" + totalRecords);
        }

        out.print("<br><br>total=" + total);
        out.print("<br>totalError=" + totalError);
    } catch (e) {
        out.print("error="+e);
    }

})();

