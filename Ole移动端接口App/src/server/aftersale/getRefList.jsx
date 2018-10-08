//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import order.js
//#import user.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {

    var res = CommonUtil.initRes();

    // try {
        var loginUserId = LoginService.getFrontendUserId();
        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.E1M000003);
            return;
        }
        var merchantId = CartUtil.getOleMerchantId(),
            page = $.params.page || 1,
            limit = $.params.limit || 10;

        var result = AfterSaleService.getAllRefundOrders(loginUserId, page, limit);
        // var result = AfterSaleService.getAllRefundOrders("u_50000", page, limit);
        // $.log("result=="+JSON.stringify(result));
        if(result){
            var recodes = result.recordList;
            var refList = getRefListInfos(recodes);
            result.recordList = refList;
            var data = result;
            CommonUtil.setRetData(res, data);
        }

    // } catch (e) {
    //     $.log(e);
    // }

})();

function getRefListInfos(refList) {
    var ret = [];
    if (refList instanceof Array) {
        for (var i = 0, len = refList.length; i < len; i++) {
            var order = {}, tmpOrder = refList[i];
            if(!tmpOrder){
                continue;
            }
            // var refundType = tmpOrder.refundType; //change,return,cancel,reason
            var type = getRefundType(tmpOrder); // 1：退货退款  2：仅退款
            var processState = getRefundState(tmpOrder); // 3.退款中  4 退款审核中 5 已退款 6 已取消

            var reason = "";
            if (tmpOrder.reason) {
                reason = tmpOrder.reason.name ? tmpOrder.reason.name : "";
            }


            //退款意向金额
            order.totalRefundPrice = tmpOrder.totalRefundPrice ? (Number(tmpOrder.totalRefundPrice) / 100).toFixed(2) : 0.00;

            //商品图片
            var items = tmpOrder.items;
            order.items = getItemsInfo(items);

            order.id = tmpOrder.id; //退款单单号
            order.orderAliasCode = tmpOrder.orderAliasCode; //订单号
            order.totalRefundPrice = tmpOrder.totalRefundPrice ? (Number(tmpOrder.totalRefundPrice) / 100).toFixed(2) : 0.00;
            order.formatTime = DateUtil.getLongDate(Number(tmpOrder.createTime));
            order.reason = reason;
            order.processState = processState;
            order.type = type;

            ret.push(order);
        }
    }

    return ret;
}


/**
 * 获取退款单商品行信息（图片，名称 价格等等）
 * @param items
 * @returns {Array}
 */
function getItemsInfo(items) {
    var ret = [];
    if (!isEmptyObject(items)) {
        for (var k in items) {
            var item = {};
            var value = items[k];
            item.cartItemId = k;
            item.realSkuId = value.realSkuId;
            item.productId = value.productId;
            item.name = value.name;
            item.imgUrl = "";
            var dynaAttrs = value.DynaAttrs;

            if (dynaAttrs.attr_10000.value && dynaAttrs.attr_10000.value[0]) {
                var fileId = dynaAttrs.attr_10000.value[0].fileId;
                (item.imgUrl = FileService.getFullPath(fileId));
            }
            item.signedAmount = value.signedAmount;  //总数量（已签收数量）
            item.exchangedAmount = value.exchangedAmount; //申请退货数量

            var priceInfo = {};
            if (!isEmptyObject(value.priceInfo)) {
                priceInfo.fUnitPrice = value.priceInfo.fUnitPrice; //商品单价
            }
            item.priceInfo = priceInfo;

            ret.push(item);
        }
    }
    return ret;
}

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};


function getRefundState(refundOrder) {
    var processState = {}
    if (!refundOrder) {
        return processState;
    }
    if (refundOrder.states) {
        var refundApproveState = "";
        var refundState = "";
        if (refundOrder.states.approveState) {
            refundApproveState = refundOrder.states.approveState.state;
        }
        if (refundOrder.states.refundState) {
            refundState = refundOrder.states.refundState.state;
        }
        if (refundApproveState == "state_0") {
            processState.state = "3";
            processState.desc = "退款审核中";
        }
        if (refundApproveState == "state_1") {
            if (refundState == "Refund_1") {
                processState.state = "5";
                processState.desc = "已退款";
            } else {
                processState.state = "4";
                processState.desc = "退款中"
            }

        }
        if(refundApproveState=="state_2"){
            processState.state = "6";
            processState.desc = "已取消";
        }
    }
    return processState;
}

/**
 * 获取退款单关联的退货单类型：如果没有关联的退货单，则为仅退款
 * @param refundOrder
 */
function getRefundType(refundOrder) {
    var type = {state: "2", desc: "仅退款"}; //1：退货退款  2：仅退款 3.已取消（审核未通过）
    if (refundOrder) {
        var refundType = refundOrder.refundType; //change,return,cancel,reason
        if (refundType == "return") { //如果是退货退款订单，则获取到相关联的退货单approveState state_1 已同意退款
            var returnOrder = AfterSaleService.getOrder(refundOrder.returnOrderId);
            if(returnOrder.states&&returnOrder.states.approveState){
                var　approveState = returnOrder.states.approveState.state;
                if(approveState=="state_1"){
                    type.state = "1";
                    type.desc = "退货退款";
                }
            }
        }
    }

    return type;
}