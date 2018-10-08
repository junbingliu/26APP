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
//#import PreSale.js
//#import $oleMobileApi:services/OrderListQuery.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/CartUtil.jsx
//#import $oleMobileApi:services/OleShopService.jsx
;(function () {
    /**扫码购首页信息接口
     *
     * @param code
     * @param msg
     * @param data
     * wupeng
     */
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }


    try {
        var loginUserId = LoginService.getFrontendUserId();//当前登陆用户

        if (!loginUserId) {
            // loginUserId = $.params.loginUserId;
            setResultInfo("E1M000003","请先登陆");
            return;
        }
        var orderType = "scanbuy";

        var payState = "p200";     //支付状态


            var searchParams = {};


            searchParams.orderType = orderType;
        // searchParams.payState = payState;

            searchParams.buyerId = loginUserId;

            var searchArgs = {
                fetchCount: 100,
                fromPath: 0,
                type: "ORDER"
            };
            searchArgs.sortFields = [
                {
                    field: "createTime",
                    type: "LONG",
                    reverse: true
                }
            ];

            var qValues = OrderListQuery.getQuery(searchParams);
            $.log("\n\n 扫码购订单查询 qValues = " + JSON.stringify(qValues) + "\n\n");
            var queryArgs = {
                mode: 'adv',
                q: qValues.length > 0 ? qValues : null
            };
             searchArgs.queryArgs = JSON.stringify(queryArgs);

            var searchResult = SearchService.search(searchArgs);
            var ids = searchResult.searchResult.getLists();
        $.log("\n\n 扫码购订单查询1111 ids = " + ids + "\n\n");
            var orderCount = 0;
            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var record = OrderService.getOrder(objId);
                if (record) {
                    if (record.states && record.states.processState) {
                        var recordProcessState = record.states.processState.state || "";
                        if (payState == "p200" && recordProcessState == "p111") {
                            continue;
                        }
                    }
                    orderCount ++;
                }
            }
        setResultInfo("S0A00000", "success",{"orderTotal":orderCount});
    } catch (e) {
        $.error("查询首页信息失败" + e);
        setResultInfo("E1B0001333","查询首页信息失败" + e);
    }
})();