//#import Util.js
//#import sysArgument.js
//#import login.js
//#import realPayRec.js
//#import payment.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {

        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.modules.payment,
            Packages.net.xinshi.isone.commons,
            Packages.java.util,
            Packages.org.apache.commons.lang,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.security,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order,
            Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
            Packages.net.xinshi.isone.functions.product
        );

        var contextPath = request.getContextPath();
        var orderId = request.getParameter("id");
        try {
            var userId = "";
            var user = LoginService.getFrontendUser();
            if (user) {
                userId = user.id;
            } else {
                response.sendRedirect("/login.html?rurl=" + selfApi.URLEncoder.encode("/ucenter/order_detail.html?id=" + orderId, "utf-8"));
                return;
            }

            var paymentId = request.getParameter("paymentId");
            var bankCode = request.getParameter("bankCode");
            if (selfApi.StringUtils.isBlank(orderId) || !orderId.startsWith("o_") || selfApi.StringUtils.isBlank(paymentId)) {
                //response.sendRedirect(contextPath + "/shopping/receiveOrderResult.jsp?msg=1&orderId=" + orderId);
                return;
            }

            var jOrder = selfApi.OrderFunction.getOrder(orderId);

            var buyerInfo = jOrder.getJSONObject("buyerInfo");
            var buyerUserId = buyerInfo.optString("userId");
            if (!userId.equals(buyerUserId)) {
                //out.print("<script>alert('非法操作，此订单不属于当前登录的会员！');history.back();</script>");
                response.sendRedirect(contextPath + "/shopping/receiveOrderResult.jsp?msg=" + URLEncoder.encode("非法操作，此订单不属于当前登录的会员。", "utf-8") + "&orderId=" + orderId);
                return;
            }


            //检查订单状态
            var states = selfApi.OrderUtil.getStates(jOrder);
            var processState = selfApi.OrderUtil.getProcessStateValue(states);
            if (processState.name().equals("p111")) {
                response.sendRedirect(contextPath + "/shopping/receiveOrderResult.jsp?msg=" + URLEncoder.encode("订单已取消", "utf-8") + "&orderId=" + orderId);
                return;
            }

            var jPayRecs = jOrder.optJSONObject("payRecs");
            if (jPayRecs == null) {
                response.sendRedirect(contextPath + "/shopping/receiveOrderResult.jsp?msg=2&orderId=" + orderId);
                return;
            }

            var jPayRec = null;
            var keyIt = jPayRecs.keys();

            while (keyIt.hasNext()) {  //获取在线支付的payRec
                var id = keyIt.next().toString();
                var payRecInfo = jPayRecs.getJSONObject(id);
                if (selfApi.IPayInterfaceService.PAY_ID_ONLINE_PAY.equals(payRecInfo.optString("payInterfaceId"))) {
                    //如果是在线支付
                    jPayRec = payRecInfo;
                    //System.out.println("=========1========"+payRecInfo.optString("payInterfaceId")+"===========");
                    break;
                }
            }

            var jPayment = selfApi.IsoneModulesEngine.merchantPaymentService.getMerchantPayment(paymentId);
            if (jPayRec == null) {
                var list = selfApi.OrderHelper.getUnPayPayIdsInfo(jOrder);
                for (var i = 0; i < list.size(); i++) {
                    var sPayRecId = list.get(i);
                    jPayRec = jPayRecs.optJSONObject(sPayRecId);
                    jPayRec.put("orderId", orderId);
                    jPayRec.put("paymentId", paymentId);
                    jPayRec.put("paymentName", jPayment.optString("paymentName"));
                    jPayRec.put("payInterfaceId", jPayment.optString("payInterfaceId"));
                    jPayRecs.put(sPayRecId, jPayRec);
                    //System.out.println("=========2========"+jPayRec+"===========");
                }
            } else {
                //在线支付的payRec需要设置成会员选择的支付方式
                jPayRec.put("orderId", orderId);
                jPayRec.put("paymentId", paymentId);
                jPayRec.put("paymentName", jPayment.optString("paymentName"));
                jPayRec.put("payInterfaceId", jPayment.optString("payInterfaceId"));
                //System.out.println("=========3========"+jPayRec+"===========");
            }

            selfApi.OrderHelper.redoOrderPayType(jOrder);
            selfApi.IsoneOrderEngine.orderService.updateOrder(orderId, jOrder, userId);
            var payInterface = selfApi.PaymentUtil.getPayInterface(paymentId);
            if (payInterface != null) {
                var ip = selfApi.Util.getClientIP(request);
                if (selfApi.StringUtils.isNotBlank(ip)) {
                    //System.out.println("=========4========"+jPayRec+"==========ip="+ip);
                    jPayRec.put("ip", ip);
                }
                //银行代码
                if (selfApi.StringUtils.isNotBlank(bankCode)) {
                    jPayRec.put("bankCode", bankCode);
                }
                var aliasCode = jOrder.optString("aliasCode");
                jPayRec.put("userId", userId);
                jPayRec.put("aliasCode", aliasCode);

                //是否启用新购物流程
                var isNewBuyFlow = SysArgumentService.getSysArgumentStringValue("head_merchant", "c_argument_platformKey", "isNewBuyFlow");

                var now = (new Date()).getTime();
                var payHtml = "";
                if (isNewBuyFlow) {
                    var realPayRec = {
                        merchantId: "head_merchant",
                        orderIds: orderId + "",
                        orderAliasCodes: aliasCode + "",
                        needPayMoneyAmount: jPayRec.optString("needPayMoneyAmount") + "",
                        payRecordIds: orderId + "%" + jPayRec.optString("payRecId") + "",
                        createTime: now,
                        lastModifyTime: now,
                        payState: "uncertain",
                        payInterfaceId: jPayment.optString("payInterfaceId") + "",
                        integralPoints: 0,
                        integralMoneyRatio: 0,
                        paymentName: jPayment.optString("paymentName") + "",
                        paymentId: paymentId + "",
                        ip: $.getClientIp() + "",
                        bankCode: bankCode || "",
                        userId: userId || ""
                    };
                    var id = RealPayRecordService.addRealPayRecord(realPayRec);
                    realPayRec.id = id;
                    payHtml = PaymentService.getPayHtml(realPayRec);
                } else {
                    payHtml = payInterface.getPayHTML(jPayRec);
                }

                //如果是微信支付
                var payInterfaceId = jPayRec.optString("payInterfaceId");
                if (selfApi.StringUtils.equals(selfApi.IPayInterfaceService.PAY_ID_WXNATIVE_PAY, payInterfaceId) &&
                    selfApi.StringUtils.startsWith(payHtml, "weixin://")) {
                    var code_url = selfApi.Md5Service.encString(payHtml, "!@#a_z_8888");
                    response.sendRedirect(contextPath + "/shopping/wxqrcode.jsp?orderId=" + orderId + "&codeUrl=" + code_url);
                    return;
                }

                setPageDataProperty(pageData, "payHtml", payHtml + "");
            }
            setPageDataProperty(pageData, "orderId", orderId + "");

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid, "col_sysargument", "webName_cn");
            setPageDataProperty(pageData, "webName", webName);
        } catch (e) {
            $.log(e);
            response.sendRedirect(contextPath + "/shopping/receiveOrderResult.jsp?msg=3&orderId=" + orderId);
        }

    });
})(dataProcessor);