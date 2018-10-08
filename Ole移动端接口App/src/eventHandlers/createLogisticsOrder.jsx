//#import Util.js
//#import md5Service.js
//#import HttpUtil.js
//#import doT.min.js
//#import product.js
//#import @server/util/CommonUtil.jsx

/**
 * 冷冻冷藏商品走优达接口，常温商品走顺丰接口，非常温订单添加字段isFreezing:true
 */
(function () {

    $.log("===============开始物流下单=====");

    try {

        var jOrder = ctx.get("order_object");
        var order = JSON.parse(jOrder.toString());
        var data = {};
        data.orderid = order.aliasCode;
        data.is_gen_bill_no = 1; //是否要求返回顺丰运单号 1：要求 其他不要求
        data.j_company = "ole精品超市";
        data.j_contact = "李先生";
        data.j_tel = "8888888";
        data.j_country = "中国";
        data.j_province = "广东省";
        data.j_city = "深圳市";
        data.j_county = "罗湖区";
        data.j_address = "广东省深圳市罗湖区水北二路27号";
        data.d_company = order.deliveryInfo.userName;
        data.d_contact = order.deliveryInfo.userName;
        data.d_tel = order.deliveryInfo.mobile;

        var d_regions = order.deliveryInfo.regionPath.split("-");

        data.d_country = d_regions[0];
        data.d_province = d_regions[1];
        data.d_city = d_regions[2];
        data.d_county = d_regions[3] || "";
        data.d_address = order.deliveryInfo.address;
        data.d_post_code = order.deliveryInfo.postalCode;  //邮编

        data.custid = "7551878519";
        data.express_type = "1";
        data.pay_method = "2";

        var items = order.items;
        var cargo = {};
        var name = "";
        for (var k in items) {
            var value = items[k];
            name += value.name + "|";
            var skuId = value.skuId;
            cargo.count = value.amount;
            var product = ProductService.getProductWithoutPrice(skuId);
            cargo.unit = product ? product.sellUnitName : "";
        }
        cargo.name = name;
        cargo.currency = "CNY";

        data.cargo = cargo;

        var template = $.getProgram(appMd5, "template/createOrderTemplate.jsxp");
        var pageFn = doT.template(template);
        var xml = pageFn(data);
        var verifyCode = CommonUtil.getVerifyCode(xml + checkWord);
        var postData = {xml: xml, verifyCode: verifyCode};


        var returnData = HttpUtils.post(url, postData);
        var xPath = "/Response/Head";
        var head = CommonUtil.getNodeValue(returnData, xPath);

        if ("OK" == head.toUpperCase()) {
            xPath = "/Response/Body/OrderResponse";
            var result = CommonUtil.getAttrsToJSON(returnData, xPath);
            var filter_result = result.filter_result;  //筛单结果 1：人工确认 2：可收派 3：不可以收派
            if (filter_result == "1") {
                //TODO 调取人工筛单接口获取筛单结果
            }
            if (filter_result == "2") {
                response.sendRedirect("eventHandlers/sfOrderConfirm.jsx?aliasCode=" + order.orderAliasCode);
            }
            if (filter_result == "3") {
                var remark = result.remark; //不可以派收原因代码 1.收方超范围 2.派方超范围 3.其他原因
            }
            var mailno = result.mailno; //顺丰运单号
            var destcode = result.destcode;  //目的地区域代码
            var origincode = result.origincode;  //原寄地区域代码
            var orderid = result.orderid;
            var return_tracking_no = result.return_tracking_no;  //签回单服务运单号

        } else {
            xPath = "/Response/ERROR";
            var result = CommonUtil.getNodeValue(returnData, xPath);
        }
        $.log("result==" + result);

    } catch (e) {
        $.log(e);
    }
})();