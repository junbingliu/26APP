//#import Util.js
//#import product.js
//#import order.js
//#import login.js
//#import normalBuy.js
//#import cart.js
//#import payment.js
//#import account.js
//#import address.js
//#import saasRegion.js
//#import underscore.js
//#import userProfile.js
//#import DistributeUtil.js
//#import realPayRec.js
//#import storeCard.js
//#import session.js
//#import user.js
//#import md5Service.js
//#import column.js
//#import PreSale.js
//#import sku.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx
//#import @server/util/OrderUtil.jsx
//#import $paymentSetting:services/paymentSettingService.jsx
;
(function () {

    try {

        var user = LoginService.getFrontendUser();//前台登录的用户
        if (!user) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var userId = user.id;//用户ID
        //var userId = "u_50000";//用户ID u_50000,u_4180008
        var shopid = $.params.shopid;//门店编码
        var memberidStr = user.memberid;//会员编码
        //var memberidStr = "6712690787182772452";//会员编码
        var orderParam = $.params.orderParam;//订单参数
        var nowDateStr = getNowFormatDate();//当前日期yyyyMMdd
        var ret = { msg: ''};
        if(!userId){
            ret.code = "E1M000011";
            ret.msg = "用户信息不存在";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!memberidStr){
            ret.code = "E1M000012";
            ret.msg = "会员编码不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!shopid){
            ret.code = "E1M000010";
            ret.msg = "门店编码不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        if (!orderParam) {
            ret.code = "E1M000009";
            ret.msg = "订单参数不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        var productId = CartUtil.getScanbuyProductId();
        if(!productId){
            ret.code = "E1M000007";
            ret.msg = "扫码购虚拟商品不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        orderParam = JSON.parse(orderParam);
        var needPayParam = ProductService.getUserScanbuyNeedpayObj(memberidStr);
        $.log("------needPayParam==="+JSON.stringify(needPayParam));
        var npshopId = needPayParam.shopid;
        if(npshopId != shopid){
            ret.code = "E1M000013";
            ret.msg = "结算门店和下单门店不一致!";
            out.print(JSON.stringify(ret));
            return;
        }
        var npDateStr = needPayParam.createDate;
        if(npDateStr != nowDateStr){
            ret.code = "E1M000014";
            ret.msg = "结算日期和下单日期不一致!";
            out.print(JSON.stringify(ret));
            return;
        }
        var needPayObj = needPayParam.needpayData;
        var goodsList = orderParam.goodsList;
        if(!goodsList){
            ret.code = "E1M000006";
            ret.msg = "商品列表不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        var priceCalcuParam = {};
        priceCalcuParam.goodsList = goodsList;
        priceCalcuParam.needPayObj = needPayObj;
        //计算订单以及商品价格信息
        var retPriceObj = ProductService.getOrderAndGoodsPriceInfo(priceCalcuParam);
        var priceStatusStr = retPriceObj.status;
        if(priceStatusStr != "0"){
            var msgstr = retPriceObj.msg;
            ret.code = "E1M000016";
            ret.msg = msgstr;
            out.print(JSON.stringify(ret));
            return;
        }
        var retPriceData = retPriceObj.data;
        //修改商品列表价格信息
        var retGoodsList = retPriceData.goodsArray;
        var paramGoodsLen = goodsList.length;
        var retGoodsLen = retGoodsList.length;
        for(var i=0;i<paramGoodsLen;i++){
            var paramGoodsObj = goodsList[i];
            var paramGoodsSeq = paramGoodsObj.seq;
            for(var j=0;j<retGoodsLen;j++){
                var retGoodsObj = retGoodsList[j];
                var retGoodsSeq = retGoodsObj.seq;
                if(retGoodsSeq == paramGoodsSeq){
                    paramGoodsObj.item_value = retGoodsObj.item_value;
                    paramGoodsObj.disc_value = retGoodsObj.disc_value;
                    paramGoodsObj.preferPrice = retGoodsObj.preferPrice;
                    paramGoodsObj.unitPrice = retGoodsObj.unitPrice;
                    break;
                }
            }
        }
        //促销信息列表
        var disclist = needPayObj.disclist;
        var points = needPayObj.points;
        var pointslist = needPayObj.pointslist;
        var needPayCouponList = needPayParam.couponslist;
        var couponList = orderParam.couponList;
        if(!couponList){
            ret.code = "E1M000002";
            ret.msg = "优惠券列表不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        $.log("------needPayCouponList------"+JSON.stringify(retPriceData));
        $.log("------couponList------"+JSON.stringify(couponList));

        var calCouponPrice = 0.0;
        var cpListLen = couponList.length;
        if(cpListLen > 0){
            if(!needPayCouponList){
                ret.code = "E1M000002";
                ret.msg = "结算优惠券列表不能为空";
                out.print(JSON.stringify(ret));
                return;
            }
            var npcListLen = needPayCouponList.length;
            for(var i=0;i<cpListLen;i++){
                var cpListObj = couponList[i];
                var cpCouponType = cpListObj.coupontype;
                for(var j=0;j<npcListLen;j++){
                    var npcListObj = needPayCouponList[j];
                    var npcCouponType = npcListObj.coupontype;
                    if(cpCouponType == npcCouponType){
                        var npcCouponVal = npcListObj.pay_value;
                        calCouponPrice = toInteger(calCouponPrice) + toInteger(npcCouponVal);
                        break;
                    }
                }
            }
            calCouponPrice = toFix(calCouponPrice/100);
        }

        var jUser = UserService.getUser(userId);
        if (!jUser) {
            ret.code = "E1M000003";
            ret.msg = "会员Id错误，取不到对应的会员：" + userId;
            out.print(JSON.stringify(ret));
            return;
        }
        var jProduct = ProductService.getProduct(productId);
        if (!jProduct) {
            ret.code = "E1M000004";
            ret.msg = "商品Id错误，取不到对应的商品：" + productId;
            out.print(JSON.stringify(ret));
            return;
        }
        if(pointslist){
            var pointsLen = pointslist.length;
            var goodsLen = goodsList.length;
            $.log("pointsLen="+pointsLen);
            for(var i=0;i<pointsLen;i++){
                var pointsObj = pointslist[i];
                for(var j=0;j<goodsLen;j++){
                    var goodsObj = goodsList[j];
                    if(pointsObj.seq == goodsObj.seq){
                        goodsObj.accurate = pointsObj.accurate;
                        goodsObj.points = pointsObj.points;
                        break;
                    }
                }
            }
        }
        $.log("------order created params------"+JSON.stringify(goodsList))
        //var totOrderPrice = retPriceData.totOrderPrice;//订单总金额
        //var totPreferPrice = retPriceData.totPreferPrice;//订单总优惠金额
        //var totPayPrice = retPriceData.totPayPrice;//订单实际应支付金额
        var totOrderPrice = needPayObj.collectionMoney;//订单总金额
        var totPreferPrice = needPayObj.totaldisc;//订单总优惠金额
        var totPayPrice = needPayObj.realityMoney;//订单实际应支付金额
        //减去券金额
        totPayPrice = toFix(totPayPrice-calCouponPrice);
        var totTicketPrice = calCouponPrice;//券支付总金额
        var states = getB2COrderState();//订单状态
        var jOrder = {};
        //买家信息
        var buyerInfo = {
            loginId: jUser.loginId || "",
            userId: jUser.id || "",
            realName: jUser.realName || ""
        };
        var merchantId = jProduct.merchantId;
        var jMerchant = MerchantService.getMerchant(merchantId);
        if (!jMerchant) {
            ret.msg = "商家Id错误，取不到对应的商家：" + merchantId;
            return ret;
        }
        //卖家信息
        var sellerInfo = {
            merName: jMerchant.name_cn,
            merId: jMerchant.objId
        };

        var deliveryInfo = {};//配送信息
        var deliveryInfoExt = {
        };//配送时间等
        $.log("------totPreferPrice="+totPreferPrice);
        $.log("------totPayPrice="+totPayPrice);
        var priceInfo = getB2CPriceInfo(totOrderPrice,totPreferPrice,totPayPrice,totTicketPrice,points);//价格信息


        var invoiceInfo = getB2CInvoiceInfo();//发票信息
        var couponArr = new Array();
        var couponLen = couponList.length;
        for(var i=0;i<couponLen;i++){
            couponArr[i] = "card_cardType_coupons_"+couponList[i].couponno;
        }
        var useCardInfo = {
            couponsInfo: couponArr
        };//会员使用的卡信息
        var giveCardInfo = {
            couponsInfo: []
        };//送券信息

        var payRecs = getB2CPayRecs(totPayPrice,totTicketPrice,couponArr);//支付信息
        $.log("------payRecs="+JSON.stringify(payRecs));
        var logisticsInfo = {};//物流商信息

        var priceRateInfo = {
            RMB2INTEGRALRate: ''
        };//积分与人民币兑换信息

        var creatorInfo = {
            loginId: jUser.loginId || "",
            userId: userId,
            realName: jUser.realName || ""
        };//创建人信息

        var description = {};//订单备注
        var deliveryPoint = {};//自提点
        $.log("---goodsList---"+goodsList);
        var itemResult = getB2CItems(productId,goodsList);//订单商品行
        if (itemResult.state == "ok") {
            jOrder.items = itemResult.items;
        } else {
            ret.msg = itemResult.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        jOrder.buyerInfo = buyerInfo;
        jOrder.sellerInfo = sellerInfo;
        jOrder.priceInfo = priceInfo;
        jOrder.states = states;
        jOrder.deliveryInfo = deliveryInfo;
        jOrder.deliveryInfoExt = deliveryInfoExt;
        jOrder.invoiceInfo = invoiceInfo;
        jOrder.logisticsInfo = logisticsInfo;
        jOrder.creatorInfo = creatorInfo;
        jOrder.priceRateInfo = priceRateInfo;
        jOrder.useCardInfo = useCardInfo;
        jOrder.giveCardInfo = giveCardInfo;
        jOrder.description = description;
        jOrder.deliveryPoint = deliveryPoint;
        jOrder.payRecs = payRecs;
        jOrder.disclist = disclist;
        jOrder.couponList = couponList;
        jOrder.shopid = shopid;//门店编码
        jOrder.isneedcheck = "0";//是否需要抽检 为位否，1为是
        jOrder.isuploadorder = "0";//是否上传订单
        jOrder.checkresult = "0";//抽检结果  0：未抽检，1：抽检成功，2：失败
        jOrder.merchantId = jMerchant.objId;
        jOrder.orderType = "scanbuy";
        jOrder.orderSource = "front";
        jOrder.payType = "300";//线上支付
        jOrder.moneyTypeId = "moneytype_RMB";
        jOrder.targetMoneyTypeId = "moneytype_RMB";
        jOrder.moneyTypeName = "RMB";
        jOrder.posOrderId = "";//pos订单流水号
        jOrder.totOrderPrice = totOrderPrice;
        jOrder.totPreferPrice = totPreferPrice;
        jOrder.totPayPrice = totPayPrice;
        jOrder.totTicketPrice = totTicketPrice;
        jOrder.points = points;
        jOrder.collectionMoney = needPayObj.collectionMoney;
        jOrder.totaldisc = needPayObj.totaldisc;
        jOrder.realityMoney = needPayObj.realityMoney;
        jOrder.residueMoney = needPayObj.residueMoney;
        jOrder.ruleResults = [];
        jOrder.maxUseIntegral = 0;//最多能使用多少积分
        var addRet = addB2COrder(jOrder);
        if (addRet.state == 'ok') {
            ret.code = "S0A00000";
            ret.msg = addRet.msg;
            ret.data = addRet.aliasCode || "";
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1M000001";
            ret.msg = "扫码购订单生成失败!";
            out.print(JSON.stringify(ret));
        }

    } catch (e) {
        $.log("order error info="+e);
        ret.msg = "新增扫码购订单失败异常";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

//订单状态
function getB2COrderState(){
    var b2cProcessState = getB2COrderProcessState();//处理状态，未确认
    var b2cPayState = getB2COrderPayState();//支付状态，未支付
    var nowTime = new Date().getTime();
    var states = {
        processState: {
            state: b2cProcessState,
            lastModifyUserId: "u_0",
            lastModifyTime: nowTime
        },//处理状态
        payState: {
            state: b2cPayState,//支付状态
            lastModifyUserId: "u_0",
            endPayTime: '',
            lastModifyTime: nowTime
        },
        refundState: {
            state: "p300"//未退款
        },
        approvalState: {
            state: "a100"//已审核
        }
    };//状态
    //处理状态
    states.processState[b2cProcessState] = {
        lastModifyUserId: "u_0",
        lastModifyTime: nowTime
    };
    //支付状态
    states.payState[b2cPayState] = {
        lastModifyUserId: "u_0",
        lastModifyTime: nowTime
    };
    return states;
}
//获取当前日期yyyyMMdd
function getNowFormatDate(){
    var day = new Date();
    var Year = 0;
    var Month = 0;
    var Day = 0;
    var CurrentDate = "";
    Year= day.getFullYear();//支持IE和火狐浏览器.
    Month= day.getMonth()+1;
    Day = day.getDate();
    CurrentDate += Year;
    if (Month >= 10 ){
        CurrentDate += Month;
    }
    else{
        CurrentDate += "0" + Month;
    }
    if (Day >= 10 ){
        CurrentDate += Day ;
    }
    else{
        CurrentDate += "0" + Day ;
    }
    return CurrentDate;
}

//订单价格信息
function getB2CPriceInfo(totOrderPrice,totPreferPrice,totPayPrice,totTicketPrice,points) {
    var stillPayPrice = toInteger(totPayPrice) - toInteger(totTicketPrice);
    var stillPayPriceYuan = toFix(stillPayPrice/100);
    $.log("------stillPayPriceYuan="+stillPayPriceYuan);
    var totOrderPriceFen = toInteger(totOrderPrice) - toInteger(totPreferPrice);
    var totOrderPriceYuan = toFix(totOrderPriceFen/100);
    var priceInfo = {
        totalOrderSupplyPrice: 0,
        fTotalOrderSupplyPrice: '0.00',
        cardPayPrice: 0,
        fCardPayPrice: '0.00',
        totalDepositPrice: 0,
        fTotalDepositPrice: '0.00',
        categorySufRebatePreferPrice: 0,
        fCategorySufRebatePreferPrice: '0.00',
        integralGivePrice:toInteger(points),
        fIntegralGivePrice:toFix(points),
        integralBuyPrice: 0,
        fIntegralBuyPrice: '0.00',
        ticketPayPrice: toInteger(totTicketPrice),
        fTicketPayPrice: toFix(totTicketPrice),
        totalOrderPrice: toInteger(totOrderPriceYuan),//订单成交价
        fTotalOrderPrice: toFix(totOrderPriceYuan),
        totalOrderRealPrice: toInteger(totOrderPriceYuan),//订单成交价
        fTotalOrderRealPrice: toFix(totOrderPriceYuan),
        totalProductPrice: toInteger(totOrderPriceYuan),//商品成交价格
        fTotalProductPrice:toFix(totOrderPriceYuan),
        totalDeliveryPrice: 0,//运费
        fTotalDeliveryPrice: '0.00',
        deliveryProductPreferPrice: 0,
        fDeliveryProductPreferPrice: "0.00",
        totalOrderPayPrice: toInteger(totTicketPrice),//已支付金额
        fTotalOrderPayPrice: toFix(totTicketPrice),
        totalTaxPrice: 0,
        fTotalTaxPrice: '0.00',
        totalBalancePrice: 0,
        fTotalBalancePrice: '0.00',
        totalOrderPreferPrice: toInteger(totPreferPrice),//订单优惠金额
        fTotalOrderPreferPrice: toFix(totPreferPrice),
        orderPreferPrice: 0,
        fOrderPreferPrice: '0.00',
        totalOrderNeedPayPrice: toInteger(totPayPrice),//订单还需要支付的金额
        fTotalOrderNeedPayPrice: toFix(totPayPrice)
    };//价格信息
    return priceInfo;
}
/**
 * 获取b2c支付信息
 * @param totalFee
 * @returns {*}
 */
function getB2CPayRecs(totalFee,totTicketPrice,couponArr) {
    var payRecs = {};
    var paymentId = "";
    var paymentName = "在线支付";
    var payState = "0";
    var payStateName = "未支付";
    payRecs['1'] = {
        paymentName: paymentName,
        payMoneyAmount: 0,
        fPayMoneyAmount: "0.00",
        needPayMoneyAmount: toInteger(totalFee),
        fNeedPayMoneyAmount: toFix(totalFee),
        moneyAmount: toInteger(totalFee),
        fMoneyAmount: toFix(totalFee),
        paymentId: paymentId || "",
        state: payState,
        stateName: payStateName,
        payInterfaceId: "payi_1"
    };
    var tickeyPriceInt = toInteger(totTicketPrice);
    if(tickeyPriceInt>0){
        var cardIdStr = "";
        var tranSerialNoStr = couponArr[0].substring(22,couponArr[0].length);
        var couLen = couponArr.length;
        var payDetails = new Array();
        for(var i=0;i<couLen;i++){
            cardIdStr = cardIdStr + couponArr[i] + ",";
            var tranSerialNoStr1 = couponArr[i].substring(22,couponArr[0].length);
            var payDetailObj = {};
            payDetailObj = {
                paymentName: "购物券",
                remark:"使用的购物券号为："+couponArr[i],
                cardIds:couponArr[i],
                tranSerialNo:tranSerialNoStr1,
                payMoneyAmount: toInteger(totTicketPrice),
                fPayMoneyAmount: toFix(totTicketPrice),
                needPayMoneyAmount: 0,
                fNeedPayMoneyAmount: "0.00",
                moneyAmount: toInteger(totTicketPrice),
                fMoneyAmount: toFix(totTicketPrice),
                paymentId: paymentId || "",
                state: "1",
                stateName: "已支付",
                payInterfaceId: "payi_2"
            }
            payDetails.push(payDetailObj);
        }
        if(cardIdStr.length>0){
            cardIdStr = cardIdStr.substring(0,cardIdStr.length-1);
        }
        payRecs['2'] = {
            paymentName: "购物券",
            remark:"使用的购物券号为："+couponArr,
            cardIds:cardIdStr,
            tranSerialNo:tranSerialNoStr,
            payMoneyAmount: toInteger(totTicketPrice),
            fPayMoneyAmount: toFix(totTicketPrice),
            needPayMoneyAmount: 0,
            fNeedPayMoneyAmount: "0.00",
            moneyAmount: toInteger(totTicketPrice),
            fMoneyAmount: toFix(totTicketPrice),
            payDetails:payDetails,
            paymentId: paymentId || "",
            state: "1",
            stateName: "已支付",
            payInterfaceId: "payi_2"
        };
    }

    return payRecs;
}
/**
 * 生成b2c的订单items
 * @param productId
 * @param goodsList
 * @returns {{state: string, msg: string}}
 */
function getB2CItems(productId,goodsList) {
    var ret = {state: 'err', msg: ''};
    if (!productId) {
        ret.msg = "商品Id为空";
        return ret;
    }
    if(!goodsList){
        ret.msg = "扫码购商品列表为空";
        return ret;
    }
    var goodsListArr = goodsList;
    var b2cItems = {};
    var jProduct = ProductService.getProduct(productId);
    if (!jProduct) {
        ret.msg = "取不到" + productId + "对应的商品";
        return ret;
    }
    var jSku = SkuService.getHeadSkuByProductId(jProduct.objId);
    if (!jSku) {
        ret.msg = "取不到" + productId + "对应的默认SKU";
        return ret;
    }
    var goodsLen = goodsListArr.length;
    for(var i=0;i<goodsLen;i++){
        var b2cItem = {};
        var goodsObj = goodsListArr[i];
        b2cItem.isNeedDelivery = "0";//是否需要配送，写死
        b2cItem.amount = goodsObj.amount;//数量
        b2cItem.chooseAmount = goodsObj.amount;//数量
        b2cItem.title = goodsObj.gname||"";//商品名称
        b2cItem.name = goodsObj.gname||"";//商品名称
        b2cItem.warehouseType = "01";//干货，冷仓？
        b2cItem.objAmount = 0;//
        b2cItem.itemId = getNewB2CItemId();//itemId，cartItem_50000
        b2cItem.productId = jProduct.objId;//商品ID
        b2cItem.realSkuId = jSku.skuId;//SKU编码
        b2cItem.categoryId = jProduct.columnId;//栏目ID
        b2cItem.brandId = jProduct.brandColumnId;//品牌ID
        b2cItem.skuId = jSku.id;//SKU内部ID
        b2cItem.taxRate = 0;//
        b2cItem.moneyTypeId = "moneytype_RMB";//价格类型
        b2cItem.moneyTypeName = "RMB ";//价格类型名称
        b2cItem.sellUnitName = jProduct.sellUnitName;//销售单位
        b2cItem.seq = goodsObj.seq||"";//商品序号
        b2cItem.spec = goodsObj.spec||"";//规格
        b2cItem.shopid = goodsObj.shopid||"";//门店ID
        b2cItem.buybag = goodsObj.buybag||"";//购物袋属性

        var goodsidstr = goodsObj.goodsid + "";
        if(goodsidstr !=0 && !goodsidstr){
            goodsidstr = "";
        }
        b2cItem.goodsid = goodsidstr;//商品编码
        b2cItem.goodsno = goodsObj.goodsno||"";//商品条码
        b2cItem.use_goodsno = goodsObj.use_goodsno||"";//扫描码
        b2cItem.customNo = goodsObj.customNo||"";//顾客编码
        b2cItem.shortname = goodsObj.shortname||"";//商品简称
        b2cItem.goodselname = goodsObj.goodselname||"";//商品销售名称
        b2cItem.uname = goodsObj.uname||"";//单位名称
        b2cItem.groupno = goodsObj.groupno||"";//大类号
        b2cItem.deptno = goodsObj.deptno||"";//小类号
        b2cItem.v_type = goodsObj.v_type||"";//业务类型
        b2cItem.p_type = goodsObj.p_type||"";//促销类型
        b2cItem.x = goodsObj.x||"";//价格因子
        b2cItem.cansale = goodsObj.cansale||"";//是否允许售卖
        b2cItem.item_value = goodsObj.item_value;//销售价格
        b2cItem.pos_price = goodsObj.price;//商品单价
        b2cItem.disc_value = goodsObj.disc_value;//折扣金额
        b2cItem.accurate = goodsObj.accurate||"";
        b2cItem.points = goodsObj.points||"0";
        var unitPrice = goodsObj.unitPrice;//交易单价
        var totalPrice = toFix(goodsObj.unitPrice*goodsObj.amount);//交易总价 单价*数量
        var originalPrice = goodsObj.item_value;//商品原价
        var preferPrice = goodsObj.preferPrice;//商品优惠价
        var pointValue = goodsObj.points;
        $.log("preferPrice="+preferPrice);
        var priceInfo = {
            unitPrice: toInteger(unitPrice),
            fUnitPrice: toFix(unitPrice),
            totalPrice: toInteger(totalPrice),
            fTotalPrice: toFix(totalPrice),
            fTaxPrice: '0.00',
            taxPrice: 0,
            fTotalTaxPrice: '0.00',
            totalTaxPrice: 0,
            erpUnitPrice: 0,
            fErpUnitPrice: '0.00',
            integralPrice: 0,
            fIntegralPrice: '0.00',
            supplyPrice: 0,
            fSupplyPrice: '0.00',
            integralRMBPrice: 0,
            fIntegralRMBPrice: '0.00',
            totalIntegralRMBPrice: 0,
            fTotalIntegralRMBPrice: '0.00',
            giveProductIntegral:toInteger(pointValue),
            fGiveProductIntegral:toFix(pointValue),
            giveOrderPreferPrice: 0,//订单优惠金额
            fGiveOrderPreferPrice: '0.00',//订单优惠金额
            originalUnitPrice: toInteger(originalPrice),
            fOriginalUnitPrice: toFix(originalPrice)//原价 = 成交价 + 优惠价
        };
        b2cItem.priceInfo = priceInfo;
        b2cItems[b2cItem.itemId] = b2cItem;
    }

    if (!ret.msg) {
        ret.state = "ok";
    }
    ret.items = b2cItems;
    return ret;
}

function addB2COrder(jB2COrder) {
    var ret = {state: 'err', msg: ''};
    var scanbuyId = "scanbuyorder";
    var lockKey = "add_order_" + scanbuyId + "_" + jB2COrder.buyerInfo.userId;
    try {
        //加锁，防止重复生成b2c订单
        ps20.lock(lockKey);
        var b2cOrderId = OrderService.addOrder(jB2COrder, jB2COrder.orderType, jB2COrder.buyerInfo.userId);
        var jOrder = OrderService.getOrder(b2cOrderId);
        if (jOrder) {
            ret.state = "ok";
            ret.msg = "扫码购订单生成成功";
            ret.aliasCode = jOrder.aliasCode;
        }
    } catch (e) {
        ret.msg = e + "";
        $.log("...................生成扫码购订单出错:" + e);
    } finally {
        //解除锁定
        ps20.unlock(lockKey);
    }
    return ret;
}
/**
 * 获取b2c新的itemId
 * @returns {string}
 */
function getNewB2CItemId() {
    return "cartItem_" + ps20.getId("cartItem");
}
/**
 * 四舍五入2位小数
 * @param value
 * @returns {*}
 */
function toFix(value) {
    if (isNaN(value)) {
        return value;
    }
    //return Number(value).toFixed(2);//这个方法有个时候不会四舍五入，如0.015不会四舍五入到0.02
    return Math.round(Number(value) * Math.pow(10, 2)) / Math.pow(10, 2);
}
/**
 * 从元转化成分
 * @param value
 * @returns {*}
 */
function toInteger(value) {
    if (isNaN(value)) {
        return value;
    }
    return Number((Number(value) * 100).toFixed(0));
}

function addKey(userId, activityId, aliasCode) {
    var obj = {orderAliasCode: aliasCode};
    ps20.saveContent(getB2COrderKey(userId, activityId), JSON.stringify(obj));
}
function getB2COrderKey(userId, activityId) {
    return "scanbuy_b2c_" + userId + "_" + activityId;
}
//订单处理状态
function getB2COrderProcessState() {
    return "p100";//p100 未确认，101 已确认
}
//订单支付状态
function getB2COrderPayState(hrtOrderPayState) {
    return "p200";//p200 未支付，p201 已支付
}

function getB2CInvoiceInfo() {
    var invoiceInfo = {
        invoiceTitleType: '个人',
        invoiceType: '普通',
        invoiceDescription: '',
        invoiceTitle: '',
        invoiceTypeKey: 'com',
        needInvoice: '不需要',
        needInvoiceKey: 'no',
        invoiceContent: ''
    };//发票信息
    return invoiceInfo;
}
