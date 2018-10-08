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

/**
 * 根据   serviceCode 决定是查询订单列表还是单个订单详情，支持高级搜索
 * @param keyword:商家名称 或者商品名称 使用模糊搜索
 * @return
 */
(function () {
    var res = CommonUtil.initRes();
    try {
        for (var key in $.params) {
            if (typeof $.params[key] === "string")
                $.params[key] = $.params[key].trim()
        }
        var serviceCode = $.params.serviceCode;
        var start = $.params.start || 0;
        var page = $.params.page || 1,
            limit = $.params.limit || 20,
            loginUserId = LoginService.getFrontendUserId();

        if (page != "0") {
            start = (page - 1) * limit;
        }

        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M000003);
            return;
        }

        if (!serviceCode) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M01001);
            return;
        }

        var keyState = $.params.state;     //
        var processState = $.params.processState;     //处理状态
        var payState = $.params.payState;     //支付状态
        var approvalState = $.params.approvalState;     //审批状态
        var buyerReviewState = $.params.buyerReviewState;//买家评论状态 br100:未评论 br101：已评论
        var stateArgs=getSearchArgs(keyState);
        if (stateArgs.payState) { //支付状态
            payState = stateArgs.payState;
        }
        if (stateArgs.processState) {//处理状态
            processState = stateArgs.processState;
        }
        if (stateArgs.buyerReviewState) {//买家评论状态 br100:未评论 br101：已评论
            buyerReviewState = stateArgs.buyerReviewState;
        }

        var keyword = $.params.keyword;     //关键字
        var createDay = $.params.createDay;    //下单时间
        var purchaserName = $.params.purchaserName;   //购买人姓名
        var purchaserPhone = $.params.purchaserPhone;  //购买人电话
        var productName = $.params.productName; //商品名称
        var aliasCode = $.params.aliasCode;   //订单号
        var orderId = $.params.orderId;     //订单内部号
        var payment = $.params.payment;     //支付方式
        var orderType = $.params.orderType;     //订单类型
        var orderSource = $.params.orderSource;     //订单来源
        var beginCreateTime = $.params.beginCreateTime;     //下单时间
        var endCreateTime = $.params.endCreateTime;     //下单结束时间
        var beginPaidTime = $.params.beginPaidTime;     //支付时间
        var endPaidTime = $.params.endPaidTime;     //支付结束时间
        var isDeliveryPoint = $.params.isDeliveryPoint;     //是否自提订单
        var sellerIds = $.params.merchantList;   //商家列表
        var createUserName = $.params.createUserName; //下单人名字
        var processName = $.params.processName; //处理人名字
        var deliveryRegionId = $.params.deliveryRegionId; //自提点地区ID
        var deliveryPointCode = $.params.deliveryPointCode; //自提点编码
        var deliveryRegion = $.params.deliveryRegion;//
        var hasShorted = $.params.hasShorted;//是否缺货
        var isGift = $.params.isGift;//是否转赠订单
        var beginFinishTime = $.params.beginFinishTime; //订单完成开始时间
        var endFinishTime = $.params.endFinishTime; //订单完成结束时间
        var beginConfirmTime = $.params.beginConfirmTime; //订单确认开始时间
        var endConfirmTime = $.params.endConfirmTime; //订单确认结束时间
        var deliveryPayMax = $.params.deliveryPayMax;//配送金额上限
        var deliveryPayMin = $.params.deliveryPayMin;//配送金额下限
        var orderPayMax = $.params.orderPayMax;//订单金额上限
        var orderPayMin = $.params.orderPayMin;//订单金额下限
        var deliveryWayId = $.params.deliveryWayId;//配送方式ID
        var hasRejected = $.params.hasRejected;//是否拒收
        var merchantId = CartUtil.getOleMerchantId();//这里获取到的MerchantId有问题，所以先注释掉
        if ("getOrderDetails" === serviceCode) {
            if (!aliasCode&&!orderId) {
                CommonUtil.setErrCode(res, ErrorCode.order.E1B01001);
                return;
            }
            var jOrder ={};
            jOrder = OrderService.getOrderByAliasCode(aliasCode);
            if (!jOrder) {
                jOrder = OrderService.getOrder(orderId);
                if(!jOrder){
                    CommonUtil.setErrCode(res, ErrorCode.order.E1M01003);
                    return;
                }
            }
            var jSmallOrder = getOrderDetails(jOrder);
            CommonUtil.setRetData(res, jSmallOrder);
            return;
        } else if ("getOrders" === serviceCode) {
            createDay = Number(createDay || "0");
            if (createDay > 0) {
                var now = new Date();
                endCreateTime = DateUtil.getShortDate(now) + " 23:59:59";
                now.setDate(now.getDate() - createDay);
                beginCreateTime = DateUtil.getShortDate(now) + " 00:00:00";
            }
            if (deliveryRegion && deliveryRegion == "col_region") {
                deliveryRegion = ""
            }
            if (deliveryRegionId && deliveryRegionId == "col_region") {
                deliveryRegionId = ""
            }

            var searchParams = {};

            searchParams.id = orderId;
            searchParams.aliasCode = aliasCode;
            searchParams.keyword = keyword;
            searchParams.payState = payState;//支付状态
            searchParams.processState = processState;//处理状态
            searchParams.orderType = orderType;
            searchParams.approvalState = approvalState;
            searchParams.beginCreateTime = beginCreateTime;
            searchParams.endCreateTime = endCreateTime;
            searchParams.beginPaidTime = beginPaidTime;
            searchParams.endPaidTime = endPaidTime;
            searchParams.isDeliveryPoint = isDeliveryPoint;
            searchParams.sellerIds = sellerIds && sellerIds.split(",");
            searchParams.orderSource = orderSource;
            searchParams.purchaserName = purchaserName;
            searchParams.createUserName = createUserName;
            searchParams.processName = processName;
            searchParams.productName = productName;
            searchParams.payInterfaceId = payment;
            searchParams.deliveryRegionId = deliveryRegionId;
            searchParams.deliveryPointCode = deliveryPointCode;
            searchParams.deliveryRegion = deliveryRegion;
            searchParams.hasShorted = hasShorted;
            searchParams.purchaserPhone = purchaserPhone;
            searchParams.isGift = isGift;
            searchParams.beginFinishTime = beginFinishTime;
            searchParams.endFinishTime = endFinishTime;
            searchParams.beginConfirmTime = beginConfirmTime;
            searchParams.endConfirmTime = endConfirmTime;
            searchParams.deliveryPayMax = deliveryPayMax;
            searchParams.deliveryPayMin = deliveryPayMin;
            searchParams.orderPayMax = orderPayMax;
            searchParams.orderPayMin = orderPayMin;
            searchParams.deliveryWayId = deliveryWayId;
            searchParams.hasRejected = hasRejected;
            searchParams.buyerId = loginUserId;
            searchParams.buyerReviewState = buyerReviewState;//评论状态
            // searchParams.sellerId = merchantId;


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
                        var jSmallOrder = getOrderDetails(jOrder);
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
            CommonUtil.setRetData(res, data);
        } else {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M01019);
        }
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.order.E1Z01001, e + "");
    }
})();

// 组装
function getSearchArgs(orderType) {
    var searchArgs = {};
    var payState = "";
    var processState = "";
    var buyerReviewState = "";
    // var orderColumnId = "";
    if (!orderType) {
        orderType = "common";
    }
    //待支付
    if (orderType == "101") {
        payState="p200";
        // orderColumnId = "c_o_u_1000" + "_" + orderType;
    }
    //待发货
    if (orderType == "102") {
        //payState = "p201";
        processState = "p101";
    }
    //待收货
    if (orderType == "103") {
        // payState = "p201";
        processState = "p102";
    }
    //待评价
    if (orderType == "107") {
        buyerReviewState = 'br100';
        processState = "p112";
    }

    if (payState) {
        searchArgs.payState = payState;
    }
    if (processState) {
        searchArgs.processState = processState;
    }
    if (buyerReviewState) {
        searchArgs.buyerReviewState = buyerReviewState;
    }
    // if (orderColumnId) {
    //     searchArgs.orderColumnId = orderColumnId;
    // }
    return searchArgs;
}


/**
 * 获取订单列表所需字段
 * @returns {return} 订单对象
 */
function getOrderDetails(jOrder) {
    var jSmallOrder = {};
    var buyerUserName = "";
    var buyerUserId = jOrder.buyerInfo.userId;
    var isDeliveryPointName = jOrder.isDeliveryPoint == "1" ? "是" : "否";
    var jBuyerUser = UserService.getUser(buyerUserId);
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
        invoiceContent: ""  //发票内容
    }

    if (jOrder.invoiceInfo) {
        invoiceInfo = $.copy(invoiceInfo, jOrder.invoiceInfo);
    }
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
        tmpItem.fTotalPrice = jItem.priceInfo.fTotalPrice;  //订单中各商品的总价格
        tmpItem.fUnitPrice = jItem.priceInfo.fUnitPrice;  //订单中各商品的单价
        if(jItem.priceInfo.fUnitPrice){
            tmpItem.fIntegralPrice = jItem.priceInfo.fGiveProductIntegral;  //订单中各商品的积分
        }
        tmpItem.moneyTypeName = jItem.moneyTypeName;
        tmpItem.signedAmount = jItem.signedAmount || 0;
        tmpItem.objType = jItem.objType || "common";//商品行类型

        //获取商品规格
        tmpItem.attrString = ProductService.getAttrsString(jItem.productId, jItem.skuId);
        var chooseAmount = 0;
        if (jItem.chooseAmount && !isNaN(jItem.chooseAmount) || jItem.chooseAmount === 0) {
            chooseAmount = jItem.chooseAmount;
        } else {
            chooseAmount = jItem.amount;
        }
        tmpItem.chooseAmount = chooseAmount;
        //是否可以售后
        if (payState && payState.state == "p201" && processState && processState.state == "p112") {
            if (!canBeRefunded && chooseAmount > 0) {
                canBeRefunded = true;
            }
        }

        newItems.push(tmpItem);
    }


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

    // if (jOrder.states && jOrder.states.payState && jOrder.states.payState.state == 'p201') {//这是原先从weixinserver里面搬过来的判断
    if (jOrder.states && jOrder.states.processState && (jOrder.states.payState.processState == 'p102'||jOrder.states.payState.processState == 'p112')) {
        jSmallOrder.cancelState = "yes";
    }else{
        jSmallOrder.cancelState = "no";
    }
    if(jOrder.payType){
        jSmallOrder.payType = jOrder.payType;
        jSmallOrder.isCashOnDelivery = isCashOnDelivery(jOrder.payType);
    }
    jSmallOrder.items = newItems;
    jSmallOrder.id = jOrder.id||"";
    jSmallOrder.souceName = getSourceName(jOrder.orderSource);
    jSmallOrder.isNeedInvoiceValue = isNeedInvoice(jOrder);
    jSmallOrder.buyerUserName = buyerUserName;
    jSmallOrder.isDeliveryPointName = isDeliveryPointName;
    jSmallOrder.merchantName = merchantName;
    jSmallOrder.payRecs = getPayRecs(jOrder);
    jSmallOrder.payStateInfo = payStateInfo;           //订单支付状态     p200：待支付【付款】    p201: 已支付
    jSmallOrder.processStateInfo = processStateInfo;  //订单审核状态      p101：待出库【取消订单】    p102：已发货【查看物流】【确认收货】     p112：已签收【查看物流】
    //p100：待审核 p101：待出库 p102：已发货 p112：已签收 p111：已取消 p113:已拒收
    jSmallOrder.refundStateInfo = refundStateInfo;  //订单审核状态
    jSmallOrder.createTime = createTime; //订单创建时间 timestamp
    jSmallOrder.createTimeString = DateUtil.getLongDate(createTime); //订单创建时间 yyyy-MM-dd HH:mm:ss
    jSmallOrder.orderAliasCode = jOrder.aliasCode;//订单号
    jSmallOrder.fTotalDeliveryPrice = jOrder.priceInfo.fTotalDeliveryPrice;// 订单运费
    jSmallOrder.fTotalOrderPrice = jOrder.priceInfo.fTotalOrderPrice;// 订单总价(商品成交价+运费)
    jSmallOrder.fTotalProductPrice = jOrder.priceInfo.fTotalProductPrice;// 单品总价格（未包含运费）
    jSmallOrder.fTotalOrderRealPrice = fTotalOrderRealPrice;
    jSmallOrder.fTotalOrderPayPrice = jOrder.priceInfo.fTotalOrderPayPrice || "0.00"; //订单实际支付金额
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

    jSmallOrder.afterState = getAfterState(jOrder.id);  //售后状态  退款中 已完成

    // $.log("getAfterSate===" + getAfterSate(jOrder.id));

    return jSmallOrder;
}

/**
 * 用于支付记录key的比较
 */
function lsThan(a, b) {
    var ret = false;
    for (var i = 0; i < b.length; i++) {
        if (a.charAt(i) < b.charAt(i)) {
            return true;
        }
    }
    return ret;
}

function getPayStateName(payState) {
    if (payState == "p200") {
        return "待支付";
    }
    if (payState == "p201") {
        return "已支付";
    }
    return "未知";
}

function getBuyerReviewStateName(buyerReviewState) {
    if (buyerReviewState == "br100") {
        return "未评价";
    }
    if (buyerReviewState == "br101") {
        return "已评价";
    }
    return "未知";
}

function getProcessStateName(processState) {
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

function getSourceName(source) {
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

function isNeedInvoice(jOrder) {
    var invoiceInfo = jOrder.invoiceInfo;
    if (invoiceInfo) {
        var needInvoiceKey = invoiceInfo.needInvoiceKey;
        if (needInvoiceKey && needInvoiceKey == "yes") {
            return "需要";
        }
    }

    return "不需要";
}

function getPayRecs(jOrder) {
    var result = [];
    var payRecs = jOrder["payRecs"];
    if (payRecs) {
        for (var key in payRecs) {
            var payValue = payRecs[key];

            var smallRecord = {};
            smallRecord.paymentName = payValue.paymentName;
            smallRecord.stateName = payValue.state == "1" ? "已支付" : "未支付";
            result.push(smallRecord);
        }
    }

    return result;
}

function getOrderTypeName(orderType) {
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
}

function getRefundStateName(refundState) {
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

function getAfterState(orderId) {
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
function isCashOnDelivery(payType) {
    if (payType == "300") {
        return true;
    }
    if (payType == "301") {
        return false;
    }
    return "未知";
}

