//#import Util.js
//#import order.js
//#import md5Service.js
//#import $getui:services/GetuiArgService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    var orderId = $.params["orderId"];
    if (!orderId) {
        out.print("请输入orderId");
        return;
    }

    //因为现在监听了订单增加后事件,所以在这里加多一些判断,防止无用的加入task
    var jOrder = OrderService.getOrderByKey(orderId.trim());
    if (!jOrder) {
        out.print("取不到订单：" + orderId);
        return;
    }
    var merchantId = jOrder.sellerInfo.merId;
    var jCheck = GetuiArgService.checkMerchantId(merchantId);
    if (jCheck.code != "0") {
        //只对接m_100的商家
        return;
    }
    var jArgs = GetuiArgService.getArgs(merchantId);
    var content = {
        title: '您有一个新的订单可以抢拣货',
        content: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode,
        time: DateUtil.getLongDate(DateUtil.getNowTime())
    };

    var postData = {
        message: {appkey: jArgs.appKey, is_offline: false, msgtype: 'notification'},
        notification: {
            text: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode,
            title: '您有一个新的订单可以抢拣货',
            transmission_type: true,
            transmission_content: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode
        },
        transmission: {
            transmission_type: false,
            transmission_content: JSON.stringify(content),
            duration_begin: '',
            duration_end: ''
        },
        cid: 'd6b9a0fb4b6c679e77e979e28b085732',
        requestid: GetuiExchangeUtil.getRequestId()
    };
    var result = GetuiExchangeUtil.postToGT(postData, "push_single", GetuiExchangeUtil.msgType.picking);
    out.print(JSON.stringify(result));
    if (result.state == "ok") {
        var ret = result.returnData.result;
    }
})();