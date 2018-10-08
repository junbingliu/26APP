//#import order.js
//#import Util.js
//#import payment.js
//#import @server/util/ErrorCode.jsx

/**
 * 预售订单尾款支付接口
 * @params aliasCode，
 */
(function () {
    var res = {code: ErrorCode.S0A00000.code, msg: ErrorCode.S0A00000.msg, data: ""};

    var aliasCode = $.params.aliasCode;
    var jOrder = OrderService.getOrderByAliasCode(orderId);

    if(!jOrder) {
        res.code = ErrorCode.order.E1B00001.code;
        res.msg = ErrorCode.order.E1B00001.msg;
        out.print(JSON.stringify(res));
    }
    if(!jOrder.orderType) {
        res.code = ErrorCode.order.E1B00002.code;
        res.msg = ErrorCode.order.E1B00002.msg;
        out.print(JSON.stringify(res));
    }
    //获取预售支付状态:0,定金未支付,1:定金已支付,尾款未支付,2:定金与尾款都已支付
    var preSalePayState = PreSaleService.getPreSalePayState(aliasCode);
    var fTotalDepositPrice = jOrder.priceInfo.fTotalDepositPrice; //订金
    var totalBalancePrice = jOrder.priceInfo.totalBalancePrice; //尾款
    var preSaleRule = PreSaleRuleService.getById(order.preSaleRuleId);
    var beginLongTime = DateUtil.getLongTime(preSaleRule.beginTime);
    var endLongTime = DateUtil.getLongTime(preSaleRule.endTime);

    //如果不在支付尾款的时间范围，则不能进行尾款支付
    if(beginLongTime < Date.now()||endLongTime>Date.now()) {
        res.code = ErrorCode.preSale.E1B00003.code;
        res.msg = ErrorCode.preSale.E1B00003.msg;
        out.print(JSON.stringify(res));
        return;
    }

    if(preSalePayState) {
        if(preSalePayState=="0") {
            res.code = ErrorCode.preSale.E1B00004.code;
            res.msg = ErrorCode.preSale.E1B00004.msg;
            out.print(JSON.stringify(res));
            return;
        }
        if(preSalePayState=="2"){

        }
    }







})();