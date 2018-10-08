//#import Util.js
//#import md5Service.js
//#import HttpUtil.js
//#import doT.min.js
//#import product.js
//#import order.js
//#import login.js
//#import delMerchant.js
//#import open-order.js
//#import sysArgument.js
//#import @server/util/CommonUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx
//#import @server/util/MathUtil.jsx
//#import $sfExchangeMgr:services/sfExchangeMgrService.jsx

(function () {
    $.log("=============create SF order handler===============");


    /**
     * 获取logisticsID，在这里取得是delMerchantColumnId
     * @param merchantId
     * @returns {*}
     */
    function getLogisticsId(merchantId) {
        var logisticsId = "";
        var delMerchants = DelMerchantService.getDelMerchants(merchantId);
        if (Array.isArray(delMerchants)) {
            for (var i = 0; i < delMerchants.length; i++) {
                var value = delMerchants[i];
                if (value && value.deliveryMerchant) {
                    if (value.deliveryMerchant.id == "pdm_103") {
                        return logisticsId = value.id;
                    }
                }
            }
        }
    }

    var auto_create = CommonUtil.getHead();
    if (auto_create == "N") {
        return;
    }

    var jOrder = ctx.get("order_object");
    var order = JSON.parse(jOrder.toString());
    var data = {};
    var merchantId = order.merchantId;
    var oleMid = CartUtil.getOleMerchantId();
    if(!oleMid){
        $.log("获取Ole商家ID失败,未配置Ole商家ID");
        // CommonUtil.setErrCode(res, ErrorCode.sfExchange.E1C00005);
        return;
    }
    if(merchantId!=oleMid){
        $.log("当前订单所属商家不是Ole商家,不从顺丰下单");
        // CommonUtil.setErrCode(res, ErrorCode.sfExchange.E1C00006);
        return;
    }

    // var logisticsId = getLogisticsId(CartUtil.getOleMerchantId()); //顺丰快递
    // var delMerchantColumnId = getLogisticsId("m_50000"); //顺丰快递
    var delMerchantColumnId = getLogisticsId(CartUtil.getOleMerchantId()); //顺丰快递
    var PlatformDelMerchant = DelMerchantService.getPlatformDelMerchant(delMerchantColumnId);
    var insure_value = "0.000";
    if (order.priceInfo) {
        var fTotalProductPrice = order.priceInfo.fTotalProductPrice; //商品总金额，不包含运费
        insure_value = Number(fTotalProductPrice).toFixed(3) + "";
    }

    if (!delMerchantColumnId) {
        $.log("没有配置物流商家");
        return;
    }
    $.log("PlatformDelMerchant==" + JSON.stringify(PlatformDelMerchant));

    data.orderid = order.aliasCode;
    data.is_gen_bill_no = 1; //是否要求返回顺丰运单号 1：要求 其他不要求
    data.j_company = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_company");
    data.j_contact = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_contact");
    data.j_tel = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_tel");
    data.j_country = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_country");
    data.j_province = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_province");
    data.j_city = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_city");
    data.j_county = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_county");
    data.j_address = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "j_address");
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

    data.custid = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "custid");
    data.express_type = "1";
    data.pay_method = "1";

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

    data.cargo = cargo;  //暂时无用，不需要提供货物的长宽高重量等信息

    var insure = {};
    insure.name = "INSURE";
    insure.value = insure_value;
    // data.insure = insure;

    data.head = CommonUtil.getHead();

    var template = $.getProgram(appMd5, "template/createOrderTemplate.jsxp");
    var pageFn = doT.template(template);
    var xml = pageFn(data);
    var verifyCode = CommonUtil.getVerifyCode(xml);
    var postData = {xml: xml, verifyCode: verifyCode};

    var logData = {};
    logData.id = order.aliasCode;
    logData.postData = postData;
    logData.opType = "create";  //日志操作类型 create,route,search
    logData.aliasCode = order.aliasCode;
    logData.merchantId = order.merchantId;


    var returnData = HttpUtils.postByTimeout(CommonUtil.getPostUrl(), postData);
    logData.returnData = returnData;
    $.log("returnData= " + returnData);
    var xPath = "/Response/Head";
    var head = CommonUtil.getNodeValue(returnData, xPath);

    if ("OK" == head.toUpperCase()) {
        logData.status = "success";
        xPath = "/Response/Body/OrderResponse";
        var result = CommonUtil.getAttrsToJSON(returnData, xPath);
        // $.log("result======11==" + JSON.stringify(result));
        var filter_result = result.filter_result;  //筛单结果 1：人工确认 2：可收派 3：不可以收派
        if (filter_result == "1") {
            //todo 调取人工筛单接口获取筛单结果
            $.log("人工筛单成功！");

            res.msg = "人工筛单成功";
            logData.msg = "人工筛单成功"
        }
        if (filter_result == "2") {
            $.log("筛单成功!");
            logData.msg = "筛单成功";

            var jLogisticsInfo = {
                billNo: result.mailno, //顺丰运单号
                delMerchantName: PlatformDelMerchant.delMerchantName || "",
                delMerchantColumnId: delMerchantColumnId,
                lastModifyTime: Date.now(),
                destcode: result.destcode, //目的地区域代码
                origincode: result.origincode,  //原寄地区域代码
                insure_value: insure_value //保价金额
            };

            jOrder.put("logisticsInfo", $.toJavaJSONObject(jLogisticsInfo));


        }
        if (filter_result == "3") {
            //todo 失败 记录日志
            var remark = result.remark; //不可以派收原因代码 1.收方超范围 2.派方超范围 3.其他原因
            logData.msg = "筛单失败,原因:" + remark;
            res.msg = remark;
        }
    } else {
        xPath = "/Response/ERROR";
        var errCode = CommonUtil.getAttrsToJSON(returnData, xPath);
        var errMsg = CommonUtil.getNodeValue(returnData, xPath);
        logData.status = "failed";
        logData.msg = "顺丰下单失败:"+errMsg;
        $.log("顺丰下单失败," + errMsg);
    }
    var logId = sfExchangeMgrService.addLog(logData);
    $.log("logId==" + logId);

})();