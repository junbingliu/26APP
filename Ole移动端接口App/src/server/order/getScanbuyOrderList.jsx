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
//#import $oleMobileApi:services/OleScanbuyOrderService.jsx
/**
 * 扫码购订单查询接口
 * 根据serviceCode决定是查询订单列表还是单个订单详情，支持高级搜索
 * @param keyword:商家名称 或者商品名称 使用模糊搜索
 * @return
 */
(function () {
    var res = CommonUtil.initRes();
    try {
        $.log("\n\n 开始扫码购订单查询 " + "\n\n");
        for (var key in $.params) {
            if (typeof $.params[key] === "string")
                $.params[key] = $.params[key].trim()
        }
        var serviceCode = $.params.serviceCode;
        var start = $.params.start || 0;
        var page = $.params.page || 1;
        var limit = $.params.limit || 50;
        var orderType = $.params.orderType || "scanbuy";     //订单类型（默认是扫码购订单)
        $.log("\n\n 开始扫码购订单查询 orderType=" +orderType+ "\n\n");
        $.log("\n\n 开始扫码购订单查询 serviceCode=" +serviceCode+ "\n\n");
        var loginUserId = LoginService.getFrontendUserId();//当前登陆用户

        if (page != "0") {
            start = (page - 1) * limit;
        }

        if (!loginUserId) {
            loginUserId = $.params.loginUserId;
            // CommonUtil.setErrCode(res, ErrorCode.order.E1M000003);
            // return;
        }

        if (!serviceCode) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M01001);
            return;
        }

        var processState = $.params.processState;     //处理状态
        var payState = $.params.payState;     //支付状态
        var approvalState = $.params.approvalState;     //审批状态

        var keyword = $.params.keyword;     //关键字
        var createDay = $.params.createDay;    //下单时间
        var purchaserName = $.params.purchaserName;   //购买人姓名
        var purchaserPhone = $.params.purchaserPhone;  //购买人电话
        var productName = $.params.productName; //商品名称
        var aliasCode = $.params.aliasCode;   //订单号
        var orderId = $.params.orderId;     //订单内部号
        var payment = $.params.payment;     //支付方式
        var isuploadorder = $.params.isuploadorder; //是否上传pos
        var orderSource = $.params.orderSource;     //订单来源
        var beginCreateTime = $.params.beginCreateTime;     //下单时间
        var endCreateTime = $.params.endCreateTime;     //下单结束时间
        var beginPaidTime = $.params.beginPaidTime;     //支付时间
        var endPaidTime = $.params.endPaidTime;     //支付结束时间
        var isDeliveryPoint = $.params.isDeliveryPoint;     //是否自提订单
        var sellerIds = $.params.merchantList;   //商家列表

        $.log("\n\n 开始扫码购订单查询 sellerIds=" +sellerIds+ "\n\n");
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
        var buyerReviewState = $.params.buyerReviewState;//买家评论状态 br100:未评论 br101：已评论
        var merchantId = orderType == "scanbuy" ? "m_840000" :CartUtil.getOleMerchantId();
        if ("getOrderDetails" === serviceCode) {
            if (!aliasCode) {
                CommonUtil.setErrCode(res, ErrorCode.order.E1B01001);
                return;
            }
            var jOrder = OrderService.getOrderByAliasCode(aliasCode);
            if (!jOrder) {
                CommonUtil.setErrCode(res, ErrorCode.order.E1M01003);
                return;
            }
            var jSmallOrder = OleScanbuyOrderService.getOrderDetails(jOrder);
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
            searchParams.payState = payState;
            searchParams.processState = processState;
            searchParams.orderType = orderType;
            searchParams.approvalState = approvalState;
            searchParams.beginCreateTime = beginCreateTime;
            searchParams.endCreateTime = endCreateTime;
            searchParams.beginPaidTime = beginPaidTime;
            searchParams.endPaidTime = endPaidTime;
            searchParams.isDeliveryPoint = isDeliveryPoint;


            // searchParams.sellerIds = sellerIds && sellerIds.split(",");
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
            searchParams.buyerReviewState = buyerReviewState;
            //searchParams.sellerId = merchantId;

            searchParams.isuploadorder = isuploadorder;



            var data = OleScanbuyOrderService.getScanbuyOrderList(searchParams,limit,start);
            CommonUtil.setRetData(res, data);
        } else {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M01019);
        }
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.order.E1Z01001, e + "");
    }
})();



