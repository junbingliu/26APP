//#import Util.js
//#import HttpUtil.js
//#import doT.min.js
//#import @server/util/CommonUtil.jsx
//#import $oleMobileApi:server/util/HttpUrlConnectUtil.jsx
/**
 * 在确定将货物交付给顺丰托运后，将运单上的一些重要信息，如快件重量通过 此接口发送给顺丰。
 * 在发货前取消订单。
 */
(function () {
    $.log("===============confirm/cancel sfexpress order===============");
    try {
        var orderid = $.params.orderAliasCode,
            dealtype = $.params.dealtype || "1", //1.确认 2.取消
            mailno = $.params.mailno || "";
        if(dealtype=="1"&&!mailno){
            out.print("【确认订单】 mailno不能为空");
            return ;
        }

        var weight = "",
            volume = "";

        var template = $.getProgram(appMd5, "template/orderConfirm.jsxp");
        var data = {};

        data.orderid = orderid;
        data.dealtype = dealtype;
        data.mailno = mailno;
        data.weight = weight;
        data.volume = volume;
        data.head = CommonUtil.getHead();

        var pageFn = doT.template(template);
        var xml = pageFn(data);
        $.log("xml" + xml);
        var verifyCode = CommonUtil.getVerifyCode(xml);
        var postData = {xml: xml, verifyCode: verifyCode};

        //var returnData = HttpUtils.post(CommonUtil.getPostUrl(), postData);
        var returnData = HttpUrlConnectUtil.postJson(CommonUtil.getPostUrl(), postData);

        var xPath = "/Response/Head";
        var head = CommonUtil.getNodeValue(returnData, xPath);

        if ("OK" == head.toUpperCase()) {
            xPath = "/Response/Body/OrderConfirmResponse";
            var result = CommonUtil.getAttrsToJSON(returnData, xPath);
            out.print(result);
        } else {
            out.print(returnData);
        }

    } catch (e) {
        $.log(e);
    }

})();