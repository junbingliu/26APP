//#import Util.js
//#import HttpUtil.js
//#import doT.min.js
//#import @server/util/CommonUtil.jsx
//#import $oleMobileApi:server/util/HttpUrlConnectUtil.jsx

/**
 * 冷冻冷藏商品走优达接口，常温商品走顺丰接口，非常温订单添加字段isFreezing:true
 */
(function () {

    $.log("===============Search SFExpress logistics info===============");

    try {
        var orderid = $.params.orderAliasCode;
        if(!orderid) {
            out.print("查询的订单号不能为空");   //不传订单号，也会返回orderid 为undefined的成功响应，所以订单号必须要传
            return;
        }

        var template = $.getProgram(appMd5, "template/orderSearchTemplate.jsxp");
        var data = {orderid: orderid};
        data.head = CommonUtil.getHead();
        var pageFn = doT.template(template);
        var xml = pageFn(data);
        $.log("xml===" + xml);
        var verifyCode = CommonUtil.getVerifyCode(xml);
        var postData = {xml: xml, verifyCode: verifyCode};


        //var returnData = HttpUtils.post(CommonUtil.getPostUrl(), postData);
        var returnData = HttpUrlConnectUtil.postJson(CommonUtil.getPostUrl(), postData);

        var xPath = "/Response/Head";
        var head = CommonUtil.getNodeValue(returnData, xPath);

        if ("OK" == head.toUpperCase()) {
            $.log("顺丰订单查询成功");
            xPath = "/Response/Body/OrderResponse";
            var result = CommonUtil.getAttrsToJSON(returnData, xPath);
            var filter_result = result.filter_result;
            var mailno = result.mailno;
            var destcode = result.destcode;
            var origincode = result.origincode;
            var orderid = result.orderid;
            out.print(JSON.stringify(result));

        } else {
            $.log("顺丰订单查询失败");
            xPath = "/Response/ERROR";
            var result = CommonUtil.getNodeValue(returnData, xPath);
            out.print(result);
        }

    } catch (e) {
        $.log(e);
    }
})();