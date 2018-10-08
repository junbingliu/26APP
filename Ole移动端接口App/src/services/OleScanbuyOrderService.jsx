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
//#import $oleMobileApi:server/util/CartUtil.jsx
//#import $oleMobileApi:services/OleShopService.jsx
/**
 * 扫码购门店业务类
 */
var OleScanbuyOrderService = (function (pigeon) {

    var f = {};
    var getOrderTypeName = function (orderType) {
        if (orderType == "common") {
            return "普通订单"
        }
        if (orderType == "panic") {
            return "限购订单"
        }
        if (orderType == "group") {
            return "团购订单"
        }
        if (orderType == "delVouchers") {
            return "提货券订单"
        }
        if (orderType == "barter") {
            return "换货订单"
        }
        if (orderType == "tryuse") {
            return "试用订单"
        }
        if (orderType == "reserve") {
            return "预约订单"
        }
        if (orderType == "virtual") {
            return "虚拟订单"
        }
        if (orderType == "preSale") {
            return "预售订单"
        }
        return "未知";

    };
    /**
     * 用于支付记录key的比较
     */
    var lsThan = function(a, b) {
        var ret = false;
        for (var i = 0; i < b.length; i++) {
            if (a.charAt(i) < b.charAt(i)) {
                return true;
            }
        }
        return ret;
    };
    var getPayStateName = function (payState) {
        if (payState == "p200") {
            return "待支付";
        }
        if (payState == "p201") {
            return "已支付";
        }
        return "未知";
    }
    var getBuyerReviewStateName = function(buyerReviewState) {
        if (buyerReviewState == "br100") {
            return "未评价";
        }
        if (buyerReviewState == "br101") {
            return "已评价";
        }
        return "未知";
    }
    var getProcessStateName = function(processState) {
        if (processState == "p100") {
            return "待审核";
        }
        if (processState == "p101") {
            return "已确认";
        }
        if (processState == "p102") {
            return "已出库";
        }
        if (processState == "p112") {
            return "已签收";
        }
        if (processState == "p111") {
            return "已取消";
        }
        if (processState == "p113") {
            return "已拒收";
        }
        return "未知";
    }

    var getSourceName = function(source) {
        if (source == "front") {
            return "前台订单";
        }
        if (source == "backend") {
            return "后台订单";
        }
        if (source == "afterservice") {
            return "换货订单";
        }
        if (source == "importexcel") {
            return "导入订单";
        }
        if (source == "phone") {
            return "手机订单";
        }
        if (source == "importtaobao") {
            return "淘宝订单";
        }
        if (source == "importjingdong") {
            return "京东订单";
        }
        if (source == "dutyfree") {
            return "免税店订单";
        }
        if (source == "mobile_androidApp") {
            return "安卓App";
        }
        if (source == "mobile_androidWeb") {
            return "安卓触屏";
        }
        if (source == "mobile_iosApp") {
            return "苹果App";
        }
        if (source == "mobile_iosWeb") {
            return "苹果触屏";
        }
        return "未知";
    }
    var isNeedInvoice = function(jOrder) {
        var invoiceInfo = jOrder.invoiceInfo;
        if (invoiceInfo) {
            var needInvoiceKey = invoiceInfo.needInvoiceKey;
            if (needInvoiceKey && needInvoiceKey == "yes") {
                return "需要";
            }
        }

        return "不需要";
    }

    var getPayRecs = function(jOrder) {
        var result = [];
        var payRecs = jOrder["payRecs"];
        //$.log("扫码购订单 支付信息 payRecs===="+JSON.stringify(payRecs));
        if (payRecs) {
            for (var key in payRecs) {
                var payValue = payRecs[key];
                //$.log("支付记录 key"+key);
                var smallRecord = {};
                //$.log("支付记录 payValue"+JSON.stringify(payValue));
                smallRecord.paymentName = payValue.paymentName;
                smallRecord.stateName = payValue.state == "1" ? "已支付" : "未支付";
                smallRecord.payMoneyAmount = isNaN(payValue.payMoneyAmount) ? 0.00 : parseFloat(payValue.payMoneyAmount).toFixed(2) ;//支付金额

                smallRecord.fPayMoneyAmount = parseFloat(parseFloat(smallRecord.payMoneyAmount)/100).toFixed(2);
                smallRecord.tranSerialNo = payValue.tranSerialNo;//流水号
                smallRecord.payRecId = payValue.payRecId;
                smallRecord.payInterfaceId = payValue.payInterfaceId;
                result.push(smallRecord);
            }
        }

        return result;
    }
    var getRefundStateName = function(refundState) {
        if (refundState == "p300") {
            return "无需退款";
        }
        if (refundState == "p301") {
            return "待退款";
        }
        if (refundState == "p302") {
            return "部分已退款";
        }
        if (refundState == "p303") {
            return "已退款";
        }
        return "未知";
    }

    var getAfterState = function(orderId) {
        var refInfo = OrderService.getRefInfo(orderId);
        if (!refInfo) {
            return null;
        }
        var refunded_reason = refInfo.refunded_reason;//其他原因退款单
        //var refunded_return = refInfo.refunded_return;//退货退款单，这个不用计算，直接使用退货单来计算
        var refunded_change = refInfo.refunded_change;//变更退款单
        var refunded_cancel = refInfo.refunded_cancel;//取消退款单
        var after_return = refInfo.after_return;//退货单
        var state = "";
        if (refunded_cancel && refunded_cancel.length > 0) {
            state = "退款中";
            for (var i = 0; i < refunded_cancel.length; i++) {
                var record = refunded_cancel[i];
                var jRefundDoc = AfterSaleService.getRefundOrder(record.id);//退款单
                //订单已取消退款的，订单处理状态不用改，还是叫已取消
                if (jRefundDoc.states.refundState && jRefundDoc.states.refundState.state && jRefundDoc.states.refundState.state == "Refund_1") {
                    state = "已退款";
                }
            }
        }
        if (refunded_reason && refunded_reason.length > 0) {
            state = "退款中";
            var isAllRefund = true;//是否所有退款单都退款完成
            for (var i = 0; i < refunded_reason.length; i++) {
                var record = refunded_reason[i];
                var jRefundDoc = AfterSaleService.getRefundOrder(record.id);//退款单
                //已取消的其他原因退款单不用理
                if (jRefundDoc.states.approveState && jRefundDoc.states.approveState.state == "state_2") {
                    continue;
                }
                if (jRefundDoc.states.refundState && jRefundDoc.states.refundState.state && jRefundDoc.states.refundState.state == "Refund_1") {
                    state = "";
                } else {
                    isAllRefund = false;
                }
            }
            if (isAllRefund) {
                state = "售后已完成";
            }
        }
        if (refunded_change && refunded_change.length > 0) {
            state = "退款中";
            var isAllRefund = true;//是否所有退款单都退款完成
            for (var i = 0; i < refunded_change.length; i++) {
                var record = refunded_change[i];
                var jRefundDoc = AfterSaleService.getRefundOrder(record.id);//退款单
                //已取消的退款单不用理
                if (jRefundDoc.states.approveState && jRefundDoc.states.approveState.state == "state_2") {
                    continue;
                }
                if (jRefundDoc.states.refundState && jRefundDoc.states.refundState.state && jRefundDoc.states.refundState.state == "Refund_1") {
                    state = "";
                } else {
                    isAllRefund = false;
                }
            }
            if (isAllRefund) {
                state = "售后已完成";
            }
        }
        if (after_return && after_return.length > 0) {
            state = "售后处理中";
            var isAllRefund = true;//是否所有退款单都退款完成
            var hasEffectiveDoc = false;//是否有效的退货单
            for (var i = 0; i < after_return.length; i++) {
                var record = after_return[i];
                var jRefundDoc = AfterSaleService.getOrder(record.id);//退货单
                //已取消的退货单不用理
                if (jRefundDoc.states.approveState && jRefundDoc.states.approveState.state == "state_2") {
                    continue;
                }
                if (jRefundDoc.states.refundState && jRefundDoc.states.refundState.state && jRefundDoc.states.refundState.state == "Refund_1") {
                    //已退款，不用处理
                    state = "";
                } else {
                    isAllRefund = false;
                }
                hasEffectiveDoc = true;
            }
            if (isAllRefund) {
                state = "售后已完成";
            }
            //如果没有有效的退货单，那就说明所有的退货单都是已取消的，不用计算状态
            if (!hasEffectiveDoc) {
                state = "";
            }
        }
        return state;

    }
    /**
     * 查询订单明细信息
     * @param id
     */
    f.getScanbuyOrderList = function (searchParams,limit,start) {
        $.log("开始调用getScanbuyOrderList\n\n");
        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
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
        var queryArgs = {
            mode: 'adv',
            q: qValues.length > 0 ? qValues : null
        };
        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var searchResult = SearchService.search(searchArgs);
        var getOrderList = function (searchResult) {
            var resultList = [];
            var ids = searchResult.searchResult.getLists();
            $.log("\n\n 扫码购订单查询ids= " + ids + "\n\n");
            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var record = OrderService.getOrder(objId);
                if (record) {
                    if (record.states && record.states.processState) {
                        var recordProcessState = record.states.processState.state || "";
                        /**
                         if (payState == "p200" && recordProcessState == "p111") {
                                continue;
                            }
                         */
                    }
                    resultList.push(record);
                }
            }
            var orderList = [];
            var totalRecords = 0;
            if (resultList && resultList.length > 0) {
                var orders = resultList;
                totalRecords = searchResult.searchResult.getTotal();
                for (var i = 0; i < orders.length; i++) {
                    var jOrder = (orders[i]);
                    var jSmallOrder = f.getOrderDetails(jOrder);
                    orderList.push(jSmallOrder);
                }
            }
            return {orderList: orderList, totalRecords: totalRecords}
        };
        var orderListInfo = getOrderList(searchResult);


        var data = {
            orderList: orderListInfo.orderList,
            total: orderListInfo.totalRecords
        };
        return data
    };
    /**
     * 订单详情
     * @param jOrder
     */
    f.getOrderDetails = function (jOrder) {
        var jSmallOrder = {};
        var buyerUserName = "";
        var buyerUserId = jOrder.buyerInfo.userId;
        var isDeliveryPointName = jOrder.isDeliveryPoint == "1" ? "是" : "否";
        var jBuyerUser = UserService.getUser(buyerUserId);
        var mobilPhone = jBuyerUser.mobilPhone;//会员手机号
        var memberlevel = jBuyerUser.memberlevel;
        var memberlevelName = "";
        $.log("扫码购订单app memberlevel==="+memberlevel);
        if(memberlevel == 'hrtv1'){
            memberlevelName = "华润通V1会员";
        }else if(memberlevel == 'hrtv2'){
            memberlevelName = "华润通V2会员";
        }else if(memberlevel == 'hrtv3'){
            memberlevelName = "华润通V1会员";
        }else if(memberlevel == 'v1'){
            memberlevelName = "OLEV1会员";
        }else if(memberlevel == 'v2'){
            memberlevelName = "OLEV2会员";
        }else if(memberlevel == 'v3'){
            memberlevelName = "OLEV3会员";
        }else {
            memberlevelName = "普通会员";
        }

        var orderTypeInfo = {},
            payStateInfo = {},
            processStateInfo = {},
            buyerReviewInfo = {},  //评价信息
            deliveryInfo = {},
            refundStateInfo = {},
            preSaleInfo = {};
        var merchantName = "";
        if (jBuyerUser) {
            buyerUserName = UserUtilService.getRealName(jBuyerUser);
        }
        if (jOrder.merchantId) {
            var MerchantInfo = MerchantService.getMerchant(jOrder.merchantId)
            merchantName = MerchantInfo && MerchantInfo.name_cn;
        }
        if (jOrder.orderType) {
            orderTypeInfo = {orderType: jOrder.orderType, name: getOrderTypeName(jOrder.orderType)};
            if (jOrder.orderType == "preSale" && jOrder.preSaleRuleId) {
                var priceInfo = jOrder.priceInfo;
                var jPreSaleRule = PreSaleService.getPreSaleRuleById(jOrder.preSaleRuleId);
                if (!!jPreSaleRule) {
                    var preSalePayState = PreSaleService.getPreSalePayState(jOrder.aliasCode);
                    needPayPrice = "0.00";
                    var needPayPrice = "";
                    if (preSalePayState == "0") {
                        needPayPrice = (parseFloat(priceInfo.fTotalDepositPrice) + parseFloat(priceInfo.fTotalBalancePrice)).toFixed(2) + "";
                    } else if (preSalePayState == "1") {
                        needPayPrice = priceInfo.fTotalBalancePrice;
                    } else {
                    }

                    var processTime = "";
                    var now = Date.now();
                    if (now < Number(jPreSaleRule.depositBeginLongTime)) {
                        processTime = "0";
                    }
                    if (now >= Number(jPreSaleRule.depositBeginLongTime) && now < (Number(jPreSaleRule.depositEndLongTime))) {
                        processTime = "1";
                    }
                    if (now >= Number(jPreSaleRule.depositEndLongTime) && now < Number(jPreSaleRule.beginLongTime)) {
                        processTime = "4";
                    }
                    if (now >= Number(jPreSaleRule.beginLongTime) && now <= Number(jPreSaleRule.endLongTime)) {
                        processTime = "2";
                    }
                    if (now > Number(jPreSaleRule.endLongTime)) {
                        processTime = "3";
                    }

                    //计算预售订金的尾款(尾款+运费)
                    var exBalance = 0, totalDeliveryPrice = 0, totalBalancePrice = 0;
                    if (priceInfo && priceInfo.totalBalancePrice) {
                        totalBalancePrice = Number(priceInfo.totalBalancePrice);
                        exBalance = (exBalance / 100).toFixed(2);
                    }
                    if (priceInfo && priceInfo.totalDeliveryPrice) {
                        totalDeliveryPrice = Number(priceInfo.totalDeliveryPrice);
                        exBalance = ((totalDeliveryPrice + totalBalancePrice) / 100).toFixed(2);
                    }


                    preSaleInfo = {
                        preSaleType: jPreSaleRule.type,
                        deposit: priceInfo.fTotalDepositPrice,
                        balance: priceInfo.fTotalBalancePrice,
                        depositBeginTime: jPreSaleRule.depositBeginTime,//定金时间
                        depositEndTime: jPreSaleRule.depositEndTime,
                        balanceBeginTime: jPreSaleRule.beginTime,//尾款时间
                        balanceEndTime: jPreSaleRule.endTime,
                        stockingTime: jPreSaleRule.stockingTime,//发货时间
                        preSalePayState: PreSaleService.getPreSalePayState(jOrder.aliasCode),//预售支付状态 预售支付状态:0,定金未支付,1:定金已支付,尾款未支付,2:定金与尾款都已支付
                        needPayPrice: needPayPrice,
                        processTime: processTime, //【0：预售未开始】【1：订金支付时间】【2：尾款支付时间】【3：预售活动结束】
                        balancePayTime: "",
                        formatBalancePayTime: "",
                        depositPayTime: "",
                        formatDepositPayTime: "",
                        exBalance: exBalance + ""
                    };
                }

            }
        }
        var payState = jOrder.states.payState;
        var processState = jOrder.states.processState;
        var payTime = "", formatPayTime = "";
        var endPayTime = "", formatEndPayTime = "";
        var depositPayTime = "", formatDepositPayTime = "", balancePayTime = "", formatBalancePayTime = "";
        if (payState) {
            var tmpPayState = payState.state;

            if (tmpPayState) {
                endPayTime = Number(payState.endPayTime) - Date.now();
                if (tmpPayState == "p201" && payState.p201) {
                    payTime = payState.p201.lastModifyTime;

                }
                if (jOrder.orderType == "preSale") {
                    preSaleInfo.balancePayTime = payTime;
                    if (payTime) {
                        preSaleInfo.formatBalancePayTime = DateUtil.getLongDate(Number(payTime));
                    }

                    var payRecs = jOrder.payRecs;
                    var key = ""; //获取支付记录的key 通过key的大小判断支付先后顺序从而确定订金和尾款
                    for (var k in payRecs) {
                        var value = payRecs[k];
                        if (value && value.payTime) {
                            if (key) {
                                if (lsThan(k, key)) {
                                    var tmpPayTime = depositPayTime;
                                    depositPayTime = value.payTime + "";
                                    balancePayTime = tmpPayTime;
                                    preSaleInfo.depositPayTime = depositPayTime;
                                } else {
                                    balancePayTime = value.payTime + "";
                                }
                                preSaleInfo.balancePayTime = balancePayTime;
                            } else {
                                depositPayTime = value.payTime + "";
                                preSaleInfo.depositPayTime = depositPayTime;
                                endPayTime = -1; //如果已支付订金，endPayTime失效
                            }
                            key = k;
                        }
                    }
                }
                if (endPayTime) {
                    formatEndPayTime = DateUtil.getLongDate(Number(endPayTime));
                }
                if (payTime) {
                    formatPayTime = DateUtil.getLongDate(Number(payTime));
                }
                if (depositPayTime) {
                    formatDepositPayTime = DateUtil.getLongDate(Number(depositPayTime));
                    preSaleInfo.formatDepositPayTime = formatDepositPayTime;
                }
                if (balancePayTime) {
                    formatBalancePayTime = DateUtil.getLongDate(Number(balancePayTime));
                    preSaleInfo.formatBalancePayTime = formatBalancePayTime;
                }
                payStateInfo = {
                    state: tmpPayState,
                    name: getPayStateName(tmpPayState),
                    endPayTime: endPayTime,
                    formatEndPayTime: formatEndPayTime,
                    payTime: payTime,
                    formatPayTime: formatPayTime
                };
            }
        }

        if (processState) {
            var tmpProcessState = processState.state;
            if (tmpProcessState) {
                processStateInfo = {state: tmpProcessState, name: getProcessStateName(tmpProcessState)};
            }
        }


        if (jOrder.states.buyerReviewState) {
            var state = jOrder.states.buyerReviewState.state;
            if (state) {
                buyerReviewInfo = {state: state, name: getBuyerReviewStateName(state)};
            }
        }

        var refundTime = "";
        var refundState = jOrder.states.refundState;
        if (refundState) {
            refundStateInfo = {state: refundStateInfo.state, name: getRefundStateName(refundStateInfo.state)}
        }

        var regionPath = jOrder.deliveryInfo.regionPath;
        if (regionPath) {
            regionPath = regionPath.replace("中国-", "").replace("-", "");
            deliveryInfo.address = regionPath + jOrder.deliveryInfo.address || "";
        }
        deliveryInfo.userName = jOrder.deliveryInfo.userName || "";
        deliveryInfo.mobile = jOrder.deliveryInfo.mobile || "";

        //物流备注信息
        var deliveryInfoExt = {};
        if (jOrder.deliveryInfoExt) {
            deliveryInfoExt.description = jOrder.deliveryInfoExt.description;
        }
        //发票信息
        var invoiceInfo = {
            invoiceTitleType: "", //发票抬头类型
            invoiceType: "",  //发票类型
            invoiceTypeKey: "",  //发票类型key  com 普通发票,vat 增值税发票
            invoiceTitle: "",  //发票抬头
            needInvoiceKey: "",  //是否需要发票key  yes 表示需要，no 表示不需要
            needInvoice: "",  //是否需要发票
            invoiceContent: "",  //发票内容
            invoiced:""
        }
        // jSmallOrder.invoiced = jOrder.invoiceInfo.invoiced || 0;//是否已开发票
        if (jOrder.invoiceInfo) {
            invoiceInfo = $.copy(invoiceInfo, jOrder.invoiceInfo);
        }
        invoiceInfo.invoiced = jOrder.invoiceInfo.invoiced || 0;
        //完成时间
        var finishTime = "", formatFinishTime = "";
        if (jOrder.finishInfo) {
            finishTime = jOrder.finishInfo.finishTime;
            if (finishTime) {
                formatFinishTime = DateUtil.getLongDate(Number(finishTime));
            }
        }

        //订单关闭时间
        var closeTime = "", formatCloseTime = "";
        if (jOrder.closeInfo) {
            closeTime = jOrder.closeInfo.closeTime;
            if (closeTime) {
                formatCloseTime = DateUtil.getLongDate(Number(closeTime));
            }
        }

        //发货时间（这里取填入物流单号的时间）
        var shipTime = "", formatShipTime = "";

        var states = jOrder.states;
        if (states && states.processState) {
            var p102State = states.processState["p102"];
            if (p102State) {
                shipTime = p102State.lastModifyTime;
                if (shipTime) {
                    formatShipTime = DateUtil.getLongDate(Number(shipTime));
                }
            }
        }

        //物流信息
        var tmpLogisticsInfo = jOrder.logisticsInfo;
        var logisticsInfo = {billNo: "", lastModifyTime: ""};
        if (tmpLogisticsInfo && tmpLogisticsInfo.billNo) {
            logisticsInfo.billNo = tmpLogisticsInfo.billNo;
            logisticsInfo.lastModifyTime = tmpLogisticsInfo.lastModifyTime;
        }


        //订单创建时间
        var createTime = jOrder.createTime;
        var canBeRefunded = false;

        var items = jOrder.items;
        var newItems = [];
        var sumChooseAmount = 0;
        for (var key in items) {
            var jItem = items[key];
            var jProduct = ProductService.getProductWithoutPrice(jItem.productId);
            var defaultLogo = "/upload/none_40.jpg";
            var logoUrl = ProductService.getProductLogo(jProduct, "202X218", "");
            logoUrl = logoUrl ? logoUrl : defaultLogo;
            var tmpItem = {};
            tmpItem.productId = jItem.productId;
            tmpItem.cartItemId = key;
            tmpItem.skuId = jItem.skuId;
            tmpItem.logoUrl = logoUrl;
            tmpItem.productName = jItem.name;
            tmpItem.amount = jItem.amount;
            tmpItem.sellUnitName = jItem.sellUnitName;
            tmpItem.fTotalPrice = parseFloat(jItem.priceInfo.fTotalPrice).toFixed(2) || 0.00;  //订单中各商品的总价格
            tmpItem.v_type = jItem.v_type;
            tmpItem.x = jItem.x;

            tmpItem.disType = jItem.p_type;//促销类型
            tmpItem.fUnitPrice = jItem.priceInfo.fUnitPrice;  //订单中各商品的单价
            $.log("ddddd=="+jItem.pos_price);

            tmpItem.posPrice = parseFloat(jItem.pos_price).toFixed(2) || 0.00;//原价格
            tmpItem.itemValue = parseFloat(jItem.item_value).toFixed(2) || 0.00;//销售价
            tmpItem.moneyTypeName = jItem.moneyTypeName;


            tmpItem.discValue = jItem.disc_value;//折扣价
            tmpItem.signedAmount = jItem.signedAmount || 0;
            //获取商品规格
            tmpItem.attrString = ProductService.getAttrsString(jItem.productId, jItem.skuId);

            tmpItem.seq = parseInt(jItem.seq);
            tmpItem.returnsAmout = !isNaN(jItem.returnsAmount) ? parseInt(jItem.returnsAmount): 0;//已退款的数量 = 已退货
            tmpItem.exchangeAmount = !isNaN(jItem.exchangedAmount) ? parseInt(jItem.exchangedAmount): 0;//已经发起退货的数量，包含了returnsAmout
            // tmpItem.chooseAmount = !isNaN(jItem.chooseAmount) ? parseInt(jItem.chooseAmount) : 0;//还能发起退货的数量

            var chooseAmount = 0;
            if (jItem.chooseAmount && !isNaN(jItem.chooseAmount) || jItem.chooseAmount === 0) {
                chooseAmount = jItem.chooseAmount;
            } else {
                chooseAmount = jItem.amount;
            }
            tmpItem.chooseAmount = chooseAmount;
            sumChooseAmount = parseInt(sumChooseAmount) + parseInt(tmpItem.chooseAmount);
            //是否可以售后
            if (payState && payState.state == "p201" && processState && processState.state == "p112") {
                if (!canBeRefunded && chooseAmount > 0) {
                    canBeRefunded = true;
                }
            }

            newItems.push(tmpItem);
        }
        newItems.sort(function(a,b){
            return a.seq-b.seq});

        var totalOrderRealPrice = jOrder.priceInfo.totalOrderRealPrice ? jOrder.priceInfo.totalOrderRealPrice : "0";
        var ticketPayPrice = jOrder.priceInfo.ticketPayPrice ? jOrder.priceInfo.ticketPayPrice : "0";
        var integralPayPrice = "0";
        if (jOrder.priceInfo.integralPayPrice) {
            integralPayPrice = jOrder.priceInfo.integralPayPrice;
            if (jOrder.priceRateInfo) {
                var rate = jOrder.priceRateInfo.RMB2INTEGRALRate ? jOrder.priceRateInfo.RMB2INTEGRALRate : "1";
                integralPayPrice = Number(integralPayPrice) * Number(rate);
            }
        }


        // $.log("totalOrderRealPrice=="+totalOrderRealPrice+",ticketPayPrice=="+ticketPayPrice+",integralPayPrice=="+integralPayPrice);
        var fTotalOrderRealPrice = ((Number(totalOrderRealPrice) - Number(ticketPayPrice) - Number(integralPayPrice)) / 100).toFixed(2) + "";


        jSmallOrder.items = newItems;
        jSmallOrder.souceName = getSourceName(jOrder.orderSource);
        jSmallOrder.isNeedInvoiceValue = isNeedInvoice(jOrder);
        jSmallOrder.buyerUserName = buyerUserName;

        jSmallOrder.buyerUserMobilePhone= mobilPhone;//会员手机号
        jSmallOrder.buyerUserLevel= memberlevelName;//会员等级
        jSmallOrder.isDeliveryPointName = isDeliveryPointName;
        jSmallOrder.merchantName = merchantName;
        jSmallOrder.payRecs = getPayRecs(jOrder);
        jSmallOrder.payStateInfo = payStateInfo;           //订单支付状态
        jSmallOrder.processStateInfo = processStateInfo;  //订单审核状态
        jSmallOrder.sumChooseAmount = sumChooseAmount;
        if(processStateInfo.state && processStateInfo.state == 'p112' && sumChooseAmount > 0){
            jSmallOrder.isCanReturnSatate = 1;
        }else {
            jSmallOrder.isCanReturnSatate = 0;
        }

        jSmallOrder.refundStateInfo = refundStateInfo;  //订单审核状态
        jSmallOrder.createTime = createTime; //订单创建时间 timestamp
        jSmallOrder.createTimeString = DateUtil.getLongDate(createTime); //订单创建时间 yyyy-MM-dd HH:mm:ss
        jSmallOrder.orderAliasCode = jOrder.aliasCode;//订单号
        var shopInfo = {};
        if(jOrder.shopid){
            shopInfo = OleShopService.getByShopId(jOrder.shopid);

        }
        jSmallOrder.shopInfo = shopInfo;
        jSmallOrder.posOrderId = (!jOrder.posOrderId) ? "" : jOrder.posOrderId;//订单号

        jSmallOrder.fTotalDeliveryPrice = jOrder.priceInfo.fTotalDeliveryPrice;// 订单运费
        jSmallOrder.fTotalOrderPrice = parseFloat(jOrder.priceInfo.fTotalOrderPrice).toFixed(2);// 订单总价(商品成交价+运费)
        jSmallOrder.fTotalProductPrice = jOrder.priceInfo.fTotalProductPrice;// 单品总价格（未包含运费）
        jSmallOrder.fTotalOrderRealPrice = fTotalOrderRealPrice;
        jSmallOrder.fTotalOrderPayPrice = parseFloat(jOrder.priceInfo.fTotalOrderPayPrice).toFixed(2) || "0.00"; //订单实际支付金额
        jSmallOrder.cardPayPrice = jOrder.priceInfo.cardPayPrice ? jOrder.priceInfo.cardPayPrice : "0.00"; //预付卡支付金额
        jSmallOrder.fIntegralPayPrice = (integralPayPrice / 100).toFixed(2); //积分值抵扣(已折算成人民币)
        jSmallOrder.ticketPayPrice = jOrder.priceInfo.fTicketPayPrice ? jOrder.priceInfo.fTicketPayPrice : "0.00"; //优惠券抵扣金额
        jSmallOrder.orderTypeInfo = orderTypeInfo;// 订单类型信息
        jSmallOrder.buyerReviewInfo = buyerReviewInfo;// 订单评价状态
        jSmallOrder.deliveryInfo = deliveryInfo; // 快递信息
        jSmallOrder.deliveryInfoExt = deliveryInfoExt; // 物流扩展信息 包含投递方式
        jSmallOrder.preSaleInfo = preSaleInfo;  //预售相关信息
        jSmallOrder.canBeRefunded = canBeRefunded;  //是否可以售后
        jSmallOrder.refundTime = refundTime;  //售后时间
        jSmallOrder.invoiceInfo = invoiceInfo;  //发票信息
        jSmallOrder.finishTime = finishTime;  //完成时间
        jSmallOrder.formatFinishTime = formatFinishTime;  //格式化的完成时间
        jSmallOrder.closeTime = closeTime;  //格式化的完成时间
        jSmallOrder.formatCloseTime = formatCloseTime;  //格式化的完成时间
        jSmallOrder.shipTime = shipTime;  //发货时间
        jSmallOrder.formatShipTime = formatShipTime;  //格式化的发货时间
        jSmallOrder.logisticsInfo = logisticsInfo;  //物流信息
        jSmallOrder.isneedcheck = jOrder.isneedcheck;//是否抽验
        jSmallOrder.giveCardInfoObject = jOrder.giveCardInfoObject;//赠劵
        jSmallOrder.afterState = getAfterState(jOrder.id);  //售后状态  退款中 已完成

        jSmallOrder.totOrderPrice = jOrder.totOrderPrice ;
        jSmallOrder.totPreferPrice = jOrder.totPreferPrice ;
        jSmallOrder.totPayPrice = jOrder.totPayPrice;
        jSmallOrder.totTicketPrice = jOrder.totTicketPrice;
        jSmallOrder.isuploadorder = jOrder.isuploadorder;//是否上传POS

        jSmallOrder.totalOrderNeedPayPrice = isNaN(jOrder.totalOrderNeedPayPrice) ? "0.00" : parseFloat(jOrder.totalOrderNeedPayPrice).toFixed(2);//待支付金额(分）
        // jSmallOrder.fTotalOrderNeedPayPrice = isNaN(jOrder.fTotalOrderNeedPayPrice) ? "0.00" : parseFloat(jOrder.fTotalOrderNeedPayPrice).toFixed(2);//待支付金额(元)
        jSmallOrder.fTotalOrderNeedPayPrice=(parseFloat(jSmallOrder.fTotalOrderPrice)- parseFloat(jSmallOrder.fTotalOrderPayPrice)).toFixed(2);
        jSmallOrder.points = jOrder.points;
        // $.log("getAfterSate===" + getAfterSate(jOrder.id));

        return jSmallOrder;
    };

    return f;
})($S);