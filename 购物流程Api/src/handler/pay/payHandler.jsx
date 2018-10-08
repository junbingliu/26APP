//#import Util.js
//#import order.js
//#import payment.js
//#import template-native.js
//#import realPayRec.js
//#import login.js
//#import session.js
//#import $paymentSetting:services/paymentSettingService.jsx


;(function (){
  var user = LoginService.getFrontendUser();
  var userId = "";

  userId = SessionService.getSessionValue( "orderUserId", request ) || user.id
  var sajiaoUserId = SessionService.getSessionValue( "sajiaoUserId", request );

  if (!userId) {
    var ret = {
      state: "notLogin"
    }
    out.print( JSON.stringify( ret ) );
    return;
  }
  var orderIds = $.params.orderIds;
  var paymentId = $.params.paymentId;
  var mode = $.params[ "mode" ];
  var bankCode = $.params[ "bankCode" ];

  var orderIdArray = orderIds.split( "," );

  var payingRecs = [];
  var effectivePayRecs = [];
  var codPayRecs = [];

  var now = (new Date()).getTime();
  var orders = [];
  for ( var i = 0; i < orderIdArray.length; i++ ) {
    var orderId = orderIdArray[ i ];
    var order = OrderService.getOrder( orderId );
    var buyerUserId;
    if (order.buyerInfo) {
      buyerUserId = order.buyerInfo.userId;
    }

    if (order.buyerInfo.userId != userId && order.buyerInfo.userId!=sajiaoUserId) {
      return;
    }

    orders.push( order );
    var payRecs = order.payRecs;
    for ( var j in payRecs ) {
      var payRec = payRecs[ j ];
      payRec.merchantId = order.merchantId;
      payRec.aliasCode = order.aliasCode;
      payRec.orderId = order.id;
      //在线支付
      if (payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' || payRec.state == '0')) {
        effectivePayRecs.push( payRec );
      }
      else if ((payRec.state == '4' || payRec.state == '0')) {
        effectivePayRecs.push( payRec );
      }
      //货到付款
      if (payRec.payInterfaceId == 'payi_0' && payRec.state == '0') {
        codPayRecs.push( payRec );
      }
    }
  }


  //判断用哪个商家的payment设置来支付这个订单
  //业务逻辑应该是每个商户配置是否继承商城的配置，如果继承就不用设置了
  //就可以合并支付，如果不是继承商城配置,就不能合并支付，就需要分别支付
  var realPayRecs = {};
  effectivePayRecs.forEach( function (payRec){
    var inheritPlatform = PaymentSettingService.getInheritPlatform( payRec.merchantId );
    if (inheritPlatform) {
      var realPayRec = realPayRecs[ 'head_merchant' ];
      if (!realPayRec) {
        realPayRec = {
          merchantId: 'head_merchant',
          payRecs: [ payRec ],
          aliasCodes: [ payRec.aliasCode ],
          orderIds: [ payRec.orderId ]
        }
        realPayRecs[ 'head_merchant' ] = realPayRec;
      }
      else {
        realPayRec.payRecs.push( payRec );
        realPayRec.aliasCodes.push( payRec.aliasCode );
        realPayRec.orderIds.push( payRec.orderId );
      }
    }
    else {
      var realPayRec = realPayRecs[ payRec.merchantId ];
      if (!realPayRec) {
        realPayRec = {
          merchantId: payRec.merchantId,
          payRecs: [ payRec ],
          aliasCodes: [ payRec.aliasCode ],
          orderIds: [ payRec.orderId ]
        }
        realPayRecs[ payRec.merchantId ] = realPayRec;
      }
      else {
        realPayRec.payRecs.push( payRec );
        realPayRec.aliasCodes.push( payRec.aliasCode );
        realPayRec.orderIds.push( payRec.orderId );
      }
    }
  } );

  var lst = [];
  for ( var merchantId in realPayRecs ) {
    var realPayRec = realPayRecs[ merchantId ];
    var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType( realPayRec.merchantId, "common" );
    realPayRec.payments = payments;
    var total = 0;
    realPayRec.payRecs.forEach( function (r){
      total += Number( r.needPayMoneyAmount );
    } );
    realPayRec.total = total;
    lst.push( realPayRec );
  }


  var codAliasCodes = [];
  codPayRecs.forEach( function (payRec){
    codAliasCodes.push( payRec.aliasCode );
  } );

  if (lst.length > 1) {
    out.print( "出错了，还没有选择支付方式" );
    return;
  }
  if (lst.length == 0) {
    out.print( "所有订单都已经支付" );
    return;
  }
  var payResult = lst[ 0 ];
  var payment = null;
  payResult.payments.forEach( function (p){
    if (p.objectMap.id == paymentId) {
      payment = p;
    }
  } );

  if (!payment) {
    out.print( "所有订单都已经支付" );
    return;
  }

  var payRecordIds = payResult.payRecs.map( function (rec){
    return rec.orderId + "%" + rec.payRecId;
  } );

  var realPayRec = {
    merchantId: payResult.merchantId,
    orderIds: orderIds,
    orderAliasCodes: payResult.aliasCodes.join( "," ),
    needPayMoneyAmount: payResult.total,
    payRecordIds: payRecordIds.join( "," ),
    createTime: now,
    lastModifyTime: now,
    payState: "uncertain",
    payInterfaceId: payment.objectMap.payInterfaceId,
    integralPoints: 0,
    integralMoneyRatio: 0,
    paymentName: payment.objectMap.paymentName,
    paymentId: paymentId,
    ip: $.getClientIp(),
    bankCode: bankCode || "",
    userId: userId || ""
  };

  var id = RealPayRecordService.addRealPayRecord( realPayRec );
  if (mode == "app") {
    //武商用的模式
    realPayRec = RealPayRecordService.getPayRecByOuterId( id );
    out.print( realPayRec.id );
  } else {
    realPayRec.id = id;
    if (realPayRec.payInterfaceId == 'payi_129') {
      //这是微信app支付
      var appData = PaymentService.getAppData( realPayRec );
      out.print( appData );

    }
    else {
      var payHtml = PaymentService.getPayHtml( realPayRec );
      //去支付
      var templateSource = $.getProgram( appMd5, "handler/pay/payHandler.html" );
      var pageFn = template.compile( templateSource );
      var pageData = {
        payHtml: payHtml
      };
      var html = pageFn( pageData );
      out.print( html );
    }
  }


})();

