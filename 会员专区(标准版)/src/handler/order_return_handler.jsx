//#import Util.js
//#import login.js
//#import address.js
//#import @jsLib/GenToken.jsx

;(function(){

    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.org.apache.commons.lang,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.base.ext,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.merchant,
        Packages.net.xinshi.isone.modules.price,
        Packages.net.xinshi.isone.modules.user,
        Packages.net.xinshi.isone.modules.payment,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.java.lang,
        Packages.java.math,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.functions.user,
        Packages.net.xinshi.isone.functions.order,
        Packages.net.xinshi.isone.modules.order.bean,
        Packages.net.xinshi.isone.modules.order.afterservice,
        Packages.net.xinshi.isone.modules.order.afterservice.tools,
        Packages.net.xinshi.isone.modules.order,
        Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
        Packages.net.xinshi.isone.functions.product,
        Packages.net.xinshi.pigeon.adapter,
        Packages.javax.servlet.http
    );

    var ret = {
        state:false,
        errorCode:""
    }
    //try{

        function calcBarterProducts(jOrder, request) {
            var jResult = new selfApi.JSONObject();
            //商品信息
            var jItems = selfApi.OrderUtil.getOrderItems(jOrder);
            var it = jItems.keys();
            var i = 0;
            var jReturnItems = new selfApi.JSONObject();
            var totalProductRefundPrice = 0; //商品总退款金额
            while (it.hasNext()) {
                var itemId =  it.next();
                var jItem = jItems.optJSONObject(itemId);
                var isBarterPresent = jItem.optString("isPresent");
                if (!isBarterPresent.equals("1")) {
                    if (selfApi.OrderItemUtil.checkItemIsVirtual(jItem) && selfApi.OrderItemUtil.getItemObjectType(jItem) == selfApi.OrderItemObjectType.combine) {
                        //如果是父商品则不需要执行下面的操作
                        continue;
                    }
                    var amount = jItem.optInt("amount");
                    var chooseAmount = jItem.optInt("chooseAmount");
                    if (selfApi.StringUtils.isBlank(jItem.optString("chooseAmount"))) {
                        chooseAmount = amount;
                    }
                    if (chooseAmount > 0) {
                        var isCheck = request.getParameter("isCheck_" + i);
                        if (isCheck.equalsIgnoreCase("true")) {
                            var amout = request.getParameter("amout_" + i);

                            var jNewItem = new selfApi.JSONObject(jItem.toString());

                            var exchangedAmount = selfApi.Double.parseDouble(amout);
                            var tempChooseAmount = chooseAmount - exchangedAmount;

                            var jPriceInfo = selfApi.OrderUtil.getPriceInfo(jNewItem);
                            var dUnitPrice = jPriceInfo.optDouble("unitPrice");

                            var bRefundPrice = new selfApi.BigDecimal(selfApi.String.valueOf(dUnitPrice));     //售后金额
                            var bExchangedAmount = new selfApi.BigDecimal(exchangedAmount);                           //退货数量
                            var tempRefundPrice = bRefundPrice.multiply(bExchangedAmount);                    //退货总额

                            var bUnitPrice = new selfApi.BigDecimal(dUnitPrice);                                      //原订单 单价
                            var bAmount = new selfApi.BigDecimal(amount);                                             //原订单 数量
                            var bTotalPrice = bUnitPrice.multiply(bAmount);                                  //在订单金额

                            totalProductRefundPrice += tempRefundPrice.doubleValue();

                            jNewItem.put("exchangedAmount", exchangedAmount);
                            jNewItem.put("chooseAmount", tempChooseAmount);
                            jNewItem.put("refundPrice", selfApi.PriceUtil.divide100(bUnitPrice));
                            jNewItem.put("refundTotalPrice", selfApi.PriceUtil.divide100(tempRefundPrice));
                            jNewItem.put("totalPrice", selfApi.PriceUtil.divide100(bTotalPrice));

                            jReturnItems.put(jNewItem.optString("itemId"), jNewItem);
                        }
                    }
                    i++;
                } else {
                    var jPresentItem = new selfApi.JSONObject(jItem.toString());
                    var exchangedAmount = selfApi.OrderItemUtil.getItemAmount(jPresentItem);//订购数量
                    var jPriceInfo = selfApi.OrderUtil.getPriceInfo(jPresentItem);//商品行价格信息
                    var dUnitPrice = selfApi.OrderPriceUtil.getPriceLongValue(jPriceInfo, selfApi.OrderItemPriceKey.unitPrice);//售价
                    var bRefundPrice = new selfApi.BigDecimal(selfApi.String.valueOf(dUnitPrice));     //售后金额
                    var bExchangedAmount = new selfApi.BigDecimal(exchangedAmount);                           //订购数量
                    var tempRefundPrice = bRefundPrice.multiply(bExchangedAmount);                    //订单总额
                    var bUnitPrice = new selfApi.BigDecimal(dUnitPrice);                                      //原订单 单价
                    var bAmount = new selfApi.BigDecimal(exchangedAmount);                                             //原订单 数量
                    var bTotalPrice = bUnitPrice.multiply(bAmount);                                  //在订单金额

                    totalProductRefundPrice += tempRefundPrice.longValue();

                    jPresentItem.put("exchangedAmount", exchangedAmount);
                    jPresentItem.put("chooseAmount", exchangedAmount);
                    jPresentItem.put("refundPrice", selfApi.PriceUtil.divide100(bUnitPrice));
                    jPresentItem.put("refundTotalPrice", selfApi.PriceUtil.divide100(tempRefundPrice));
                    jPresentItem.put("totalPrice", selfApi.PriceUtil.divide100(bTotalPrice));
                    jReturnItems.put(jPresentItem.optString("itemId"), jPresentItem);
                }
            }

            jResult.put("totalProductRefundPrice", totalProductRefundPrice);
            jResult.put("returnProducts", jReturnItems);
            clearupPresentProducts(jResult);
            return jResult;
        }

        function calcReturnProducts(jOrder,request) {
            var jResult = new selfApi.JSONObject();

            var totalPrice = 0; //原订单已支付总价
            var jPrice = selfApi.OrderUtil.getPriceInfo(jOrder);
            if (jPrice != null) {
                totalPrice = jPrice.optLong("totalOrderPayPrice");
            }
            //申请单-原商品行信息
            var jItems = new selfApi.JSONObject(selfApi.OrderUtil.getOrderItems(jOrder).toString());
            var it = jItems.keys();
            var i = 0;
            var jReturnItems = new selfApi.JSONObject();
            var totalProductRefundPrice = 0; //商品总退款金额
            while (it.hasNext()) {
                var itemId = it.next();
                var jItem = jItems.optJSONObject(itemId);
                var isPresent = jItem.optString("isPresent");
                if (!isPresent.equals("1")) {
                    if (selfApi.OrderItemUtil.checkItemIsVirtual(jItem) && selfApi.OrderItemUtil.getItemObjectType(jItem) == selfApi.OrderItemObjectType.combine) {
                        //如果是父商品则不需要执行下面的操作
                        continue;
                    }
                    var amount = jItem.optLong("amount");
                    var chooseAmount = jItem.optLong("chooseAmount");
                    if (selfApi.StringUtils.isBlank(jItem.optString("chooseAmount"))) {
                        chooseAmount = amount;
                    }
                    if (chooseAmount > 0) {
                        var isCheck = request.getParameter("isCheck_" + i);
                        if (isCheck.equalsIgnoreCase("true")) {
                            var amout = request.getParameter("amout_" + i);//退货数量
                            var jNewItem = new selfApi.JSONObject(jItem.toString());
                            var exchangedAmount = selfApi.Long.parseLong(amout);//退货数量
                            var tempChooseAmount = chooseAmount - exchangedAmount;//未退货的数量
                            var jPriceInfo = selfApi.OrderUtil.getPriceInfo(jNewItem);
                            var dUnitPrice = selfApi.OrderPriceUtil.getPriceLongValue(jPriceInfo, selfApi.OrderItemPriceKey.unitPrice);//商品单价
                            var bRefundPrice = new selfApi.BigDecimal(selfApi.String.valueOf(dUnitPrice));     //售后金额
                            var bExchangedAmount = new selfApi.BigDecimal(exchangedAmount);                           //退货数量
                            var tempRefundPrice = bRefundPrice.multiply(bExchangedAmount);                    //退货总额
                            var bUnitPrice = new selfApi.BigDecimal(dUnitPrice);                                      //原订单 单价
                            var bAmount = new selfApi.BigDecimal(amount);                                             //原订单 数量
                            var bTotalPrice = bUnitPrice.multiply(bAmount);                                  //在订单金额

                            totalProductRefundPrice += tempRefundPrice.longValue();

                            jNewItem.put("exchangedAmount", exchangedAmount);
                            jNewItem.put("chooseAmount", tempChooseAmount);
                            jNewItem.put("refundPrice", selfApi.PriceUtil.divide100(bUnitPrice));
                            jNewItem.put("refundTotalPrice", selfApi.PriceUtil.divide100(tempRefundPrice));
                            jNewItem.put("totalPrice", selfApi.PriceUtil.divide100(bTotalPrice));

                            jReturnItems.put(jNewItem.optString("itemId"), jNewItem);
                        }
                    }
                    i++;
                } else {
                    var jPresentItem = new selfApi.JSONObject(jItem.toString());
                    var exchangedAmount = selfApi.OrderItemUtil.getItemAmount(jPresentItem);//订购数量
                    var jPriceInfo = selfApi.OrderUtil.getPriceInfo(jPresentItem);//商品行价格信息
                    var dUnitPrice = selfApi.OrderPriceUtil.getPriceLongValue(jPriceInfo, selfApi.OrderItemPriceKey.unitPrice);//售价
                    var bRefundPrice = new selfApi.BigDecimal(selfApi.String.valueOf(dUnitPrice));     //售后金额
                    var bExchangedAmount = new selfApi.BigDecimal(exchangedAmount);                           //订购数量
                    var tempRefundPrice = bRefundPrice.multiply(bExchangedAmount);                    //订单总额
                    var bUnitPrice = new selfApi.BigDecimal(dUnitPrice);                                      //原订单 单价
                    var bAmount = new selfApi.BigDecimal(exchangedAmount);                                             //原订单 数量
                    var bTotalPrice = bUnitPrice.multiply(bAmount);                                  //在订单金额

                    totalProductRefundPrice += tempRefundPrice.longValue();

                    jPresentItem.put("exchangedAmount", exchangedAmount);
                    jPresentItem.put("chooseAmount", exchangedAmount);
                    jPresentItem.put("refundPrice", selfApi.PriceUtil.divide100(bUnitPrice));
                    jPresentItem.put("refundTotalPrice", selfApi.PriceUtil.divide100(tempRefundPrice));
                    jPresentItem.put("totalPrice", selfApi.PriceUtil.divide100(bTotalPrice));

                    jReturnItems.put(jPresentItem.optString("itemId"), jPresentItem);
                }
            }

            jResult.put("totalPrice", totalPrice);
            jResult.put("totalProductRefundPrice", totalProductRefundPrice);
            jResult.put("returnProducts", jReturnItems);
            clearupPresentProducts(jResult);
            return jResult;
        }



        function calcRefundInfo(jOrder, refundInfo, totalProductRefundPrice, totalOrderPayPrice) {
            var jRefunds = new selfApi.JSONArray();
            var afterOrderEventMaps = new selfApi.ConcurrentHashMapExt();
            afterOrderEventMaps.put("order_id", jOrder.optString("id"));
            afterOrderEventMaps.put("order_object", jOrder);
            afterOrderEventMaps.put("refundInfo", selfApi.StringUtils.isBlank(refundInfo) ? "" : refundInfo);
            afterOrderEventMaps.put("totalProductRefundPrice", totalProductRefundPrice + "");
            afterOrderEventMaps.put("totalOrderPayPrice", totalOrderPayPrice + "");
            selfApi.AfterSaleEventBusUtils.doFrontEndBeforeAddReturnOrderEvents(selfApi.AfterOrderEventName.frontEndBeforeAddReturnOrderEvent.name(), afterOrderEventMaps);
            jRefunds = afterOrderEventMaps.get("jRefunds");
            return jRefunds;
        }

        function getAllPayRecs(jPayRecs, isGetCardPay) {
            var result = new selfApi.ArrayList();
            for (var i = 0; i < jPayRecs.length(); i++) {
                var jPayRec = jPayRecs.optJSONObject(i);

                var payInterfaceId = jPayRec.optString("payInterfaceId");
                var isCardPay = payInterfaceId.equals(selfApi.IPayInterfaceService.PAY_ID_COUPONS_PAY);
                if (isGetCardPay && !isCardPay) {
                    continue;
                }
                if (!isGetCardPay && isCardPay) {
                    continue;
                }

                if (isCardPay) {
                    var cardIds = jPayRec.optString("cardIds").split(",");
                    for (var k = 0; k < cardIds.length; k++) {
                        var cardId = cardIds[k];
                        var jCard = selfApi.IsoneModulesEngine.cardService.getCard(cardId);
                        if (jCard == null) {
                            continue;
                        }

                        if (jCard.optString("amount").equals(jCard.optString("remainAmount"))) {
                            //当券已经退过就不再退了
                            continue;
                        }

                        var jPayDetail = new selfApi.JSONObject();
                        jPayDetail.put("payInterfaceId", payInterfaceId);
                        jPayDetail.put("paymentName", jPayRec.optString("paymentName"));
                        jPayDetail.put("cardId", cardId);
                        jPayDetail.put("cardNo", jCard.optString("cardNumber"));
                        jPayDetail.put("payMoneyAmount", selfApi.PriceUtil.multiply100(jCard.optString("amount")));
                        result.add(jPayDetail);
                    }
                } else {
                    var jPayDetail = new selfApi.JSONObject();
                    jPayDetail.put("payInterfaceId", payInterfaceId);
                    jPayDetail.put("paymentName", jPayRec.optString("paymentName"));
                    jPayDetail.put("cardNo", jPayRec.optString("tranSerialNo"));
                    jPayDetail.put("payMoneyAmount", jPayRec.optString("payMoneyAmount"));
                    jPayDetail.put("realPayRecId", jPayRec.optString("realPayRecId"));
                    jPayDetail.put("payRecId", jPayRec.optString("payRecId"));
                    jPayDetail.put("paymentId", jPayRec.optString("paymentId"));
                    jPayDetail.put("refundInterfaceId", jPayRec.optString("payInterfaceId"));
                    result.add(jPayDetail);
                }
            }
            return result;
        }

        function sortCards(cards) {
            var cardsArray = [];
            for(var i =0;i<cards.size();i++){
                cardsArray.push(JSON.parse(cards.get(i).toString()));
            }

            cardsArray.sort(function(obj1,obj2){
                var p1 = obj1.payMoneyAmount;
                var p2 = obj2.payMoneyAmount;
                return p2 - p2;
            });
            return $.toJSONObjectList(cardsArray);
        }


        function clearupPresentProducts(returnProductResult) {
            if (returnProductResult == null || returnProductResult.length() == 0) {
                return;
            }
            var returnProducts = returnProductResult.optJSONObject("returnProducts");
            var returnProductNames = returnProducts.names();
            var returnProductArray = returnProducts.toJSONArray(returnProductNames);
            for (var i = 0; i < returnProductArray.length(); i++) {
                var returnProduct = returnProductArray.optJSONObject(i);
                if (returnProduct == null || returnProduct.length() == 0) {
                    continue;
                }
                if (!"1".equals(returnProduct.optString("isPresent"))) {
                    continue;
                }
                var parentItemId = returnProduct.optString("parentItemId");
                if (matchProductName(parentItemId, returnProductNames)) {
                    continue;
                }
                returnProducts.remove(returnProduct.optString("itemId"));
            }
        }

        function matchProductName(reqName, productNames) {
            var result = false;
            if (selfApi.StringUtils.isBlank(reqName) || productNames.length() == 0) {
                return result = true;
            }
            for (var i = 0; i < productNames.length(); i++) {
                if (productNames.optString(i).equals(reqName)) {
                    return result = true;
                }
            }
            return result;
        }






        var jUser = null;
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id;
            jUser = $.toJavaJSONObject(loggedUser)
        }else{
            ret.errorCode = "not_logged";
            //out.print(JSON.stringify(ret));
            out.print("当前登录用户不存在,或登录超时，请重新登录。");
            return;
        }

        var paramToken = $.params.token;
        if(!paramToken){
            ret.errorCode = "token_empty";
            //out.print(JSON.stringify(ret));
            out.print(ret.errorCode);
            return;
        }
        var token = GenToken.get("returnOrderToken");
        if(!token) {
            ret.errorCode = "token_null";
            //out.print(JSON.stringify(ret));
            out.print(ret.errorCode);
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            //out.print(JSON.stringify(ret));
            out.print("异常请求。");
            return;
        }


        var isAppMulMerchant = selfApi.MerchantSysArgumentUtil.isAppMulMerchant();
        var mallName = "商城责任";
        if (isAppMulMerchant) {
            mallName = "商家责任";
        }

        var orderId = request.getParameter("orderId");  //订单Id
        var opertType = request.getParameter("opertType");   //barterProduct:换货，returnProduct:退货
        var selectReason = request.getParameter("selectReason");    //换货原因

        var cusRemark = request.getParameter("remark"); //问题描述
        var tempCusRemark = "请填写详细的商品问题信息，以便我们的售后人员及时判断并处理您的商品!";
        if (tempCusRemark.equals(cusRemark)) {
            cusRemark = "";
        }
        var skuWay = request.getParameter("skuWay");//获取返回方式
        if (selfApi.StringUtils.isBlank(skuWay)) {
            skuWay = "1";
        }
        var refundInfo = request.getParameter("refundInfo"); //您期望的退款方式
        var contactPerson = request.getParameter("contactPerson");        //联系人
        var mobilePhone = request.getParameter("mobilePhone");      //退货人手机号码
        if (selfApi.StringUtils.isBlank(contactPerson) && selfApi.StringUtils.isBlank(mobilePhone)) {
            out.print("null");
            return;
        }

        var jOrder = selfApi.IsoneOrderEngine.orderService.getOrder(orderId);
        if (jOrder == null) {
            ret.errorCode = "order_not_exist";
            out.print("原订单信息不存在");
            return;
        }

        var buyerInfo = jOrder.optJSONObject("buyerInfo");
        if(buyerInfo != null){
            var buyerUserId = buyerInfo.optString("userId");
            if(buyerUserId != userId){
                ret.errorCode = "unlawful_user";
                out.print("非法用户");
                return;
            }
        }

        if (opertType.equals("barterProduct")) {
            var deliveryAddressId = request.getParameter("deliveryAddress");       //退货地址Id
            var userAddressId = request.getParameter("userAddress");//换货地址ID
            var barterAddressType = request.getParameter("barterAddress");//换货配送地的方式

            //换货商品
            var jCalcBarterProducts = calcBarterProducts(jOrder, request);
            var jBarterProducts = jCalcBarterProducts.optJSONObject("returnProducts");

            //配送信息
            var jDelivery = new selfApi.JSONObject();
            var jDeliveryType = new selfApi.JSONObject();
            jDeliveryType.put("value", skuWay);
            if (selfApi.StringUtils.isNotBlank(contactPerson)) {
                jDelivery.put("userName", contactPerson);
            }
            if (selfApi.StringUtils.isNotBlank(mobilePhone)) {
                jDelivery.put("mobile", mobilePhone);
            }

            var deliveryInfo = jOrder.optJSONObject("deliveryInfo");
            var deliveryWayId = deliveryInfo.optString("deliveryWayId");
            if(selfApi.StringUtils.isBlank(deliveryWayId)){
                var deliveryRule = deliveryInfo.optJSONObject("deliveryRule");
                deliveryWayId = deliveryRule.optString("deliveryWayId");
            }
            var deliveryPointId = deliveryInfo.optString("deliveryPointId");
            if (selfApi.StringUtils.isNotBlank(barterAddressType) && barterAddressType.equals("oldBarterAddress")) {
                userAddressId = deliveryInfo.optString("addressId");
            } else {
                deliveryAddressId = userAddressId;
            }

            var jAddress = selfApi.IsoneModulesEngine.deliveryAddressService.getAddress(userId, deliveryAddressId);
            var inStoreRegionId = null;
            var inStoreRegionPath = null;
            if (skuWay.equals("0")) {
                jDeliveryType.put("name", "上门取货");
                jDeliveryType.put("value", "0");
                //地址，联系人，手机号
                inStoreRegionId = jAddress.optString("regionId");
                inStoreRegionPath = selfApi.IsoneBaseEngine.columnService.getColumnNamePathWithoutFirst(inStoreRegionId, selfApi.Global.COLUMNID_REGION_ROOT, "");
                var addresses = jAddress.optString("address");
                jDelivery.put("address", inStoreRegionPath + addresses);
                jDelivery.put("inStorePrice", 0);
                jDelivery.put("remark", "");
                jDelivery.put("phone", jAddress.optString("phone"));
                jDelivery.put("postalCode", jAddress.optString("postalCode"));
                jDelivery.put("addressId", deliveryAddressId);
                jDelivery.put("regionId", inStoreRegionId);
            } else if (skuWay.equals("1")) {
                jDeliveryType.put("name", "客户寄回");
                jDeliveryType.put("value", "1");
                jDelivery.put("inStorePrice", 0);
                jDelivery.put("remark", "");
            }
            jDelivery.put("deliveryType", jDeliveryType);

            var jDeliveryPayer = new selfApi.JSONObject();
            jDeliveryPayer.put("name", "商家");
            jDeliveryPayer.put("value", "0");

            jDelivery.put("deliveryPayer", jDeliveryPayer);

            //换货出库信息
            var changeAddress = selfApi.IsoneModulesEngine.deliveryAddressService.getAddress(userId, userAddressId);
            var outStoreRegionId = changeAddress.optString("regionId");
            var outStoreRegionPath = null;
            var jOutStores = new selfApi.JSONObject();
            if (skuWay.equals("1") && inStoreRegionId != null && inStoreRegionId.equals(outStoreRegionId)) {
                outStoreRegionPath = inStoreRegionPath;
            } else {
                outStoreRegionPath = selfApi.IsoneBaseEngine.columnService.getColumnNamePathWithoutFirst(outStoreRegionId, selfApi.Global.COLUMNID_REGION_ROOT, "");
            }

            jOutStores.put("phone", changeAddress.optString("phone"));
            jOutStores.put("mobile", changeAddress.optString("mobile"));
            jOutStores.put("postalCode", changeAddress.optString("postalCode"));
            jOutStores.put("address", outStoreRegionPath + changeAddress.optString("address"));
            jOutStores.put("remark", "");
            jOutStores.put("userName", changeAddress.optString("userName"));
            jOutStores.put("regionId", changeAddress.optString("regionId"));
            jOutStores.put("addressId", changeAddress.optString("id"));
            jOutStores.put("outStorePrice", 0);

            var deliveryWays = selfApi.IsoneModulesEngine.deliveryService.getDeliveryWay(deliveryWayId); //获取配送方式信息
            var supportDP = deliveryWays.optString("isSupportDP");
            var deliveryPointName;
            if ("1".equals(supportDP) && selfApi.StringUtils.isNotBlank(deliveryPointId)) {
                var deliveryPoints = selfApi.IsoneModulesEngine.deliveryPointService.getDeliveryPoint(deliveryPointId);//自提点信息
                deliveryPointName = deliveryPoints.optString("name");
                var deliveryPoint = new selfApi.JSONObject();
                deliveryPoint.put("value", deliveryPointId);
                deliveryPoint.put("name", deliveryPointName);
                jOutStores.put("deliveryPoint", deliveryPoint);
            }

            if (selfApi.StringUtils.isNotBlank(deliveryWayId)) {
                var deliveryWayValue = new selfApi.JSONObject();
                deliveryWayValue.put("value", deliveryWayId);
                deliveryWayValue.put("name", deliveryWays.optString("name"));
                jOutStores.put("deliveryWay", deliveryWayValue);
            }

            var jDeliveryInfo = new selfApi.JSONObject();
            jDeliveryInfo.put("inStore", jDelivery);       //换货入库信息
            jDeliveryInfo.put("outStore", jOutStores);

            // 原因
            var jReason = selfApi.AfterOrderHelper.getResponsibilityDesc(selectReason);

            // 责任信息
            var jDuty = new selfApi.JSONObject();
            jDuty.put("name", mallName);
            jDuty.put("value", "0");

            var jBarterOrderInfo = new selfApi.JSONObject();
            jBarterOrderInfo.put("orderId", orderId);
            jBarterOrderInfo.put("afterSource", selfApi.IAfterService.REFUND_ORDER);
            jBarterOrderInfo.put("products", jBarterProducts);
            jBarterOrderInfo.put("deliveryInfo", jDeliveryInfo);
            jBarterOrderInfo.put("duty", jDuty);
            jBarterOrderInfo.put("reason", jReason);
            jBarterOrderInfo.put("remark", "");
            jBarterOrderInfo.put("cusRemark", cusRemark);

            var jConfig = new selfApi.JSONObject();
            jConfig.put("isNeedApprove", true);

            var jResult = selfApi.BarterOrderAddUtil.addBarterOrder(userId, jBarterOrderInfo, jConfig);

            if (jResult.optString("code").equals("0")) {
                out.print("ok");
                return;

            } else {
                out.print(jResult.optString("msg"));
                return;


            }
        } else if (opertType.equals("returnProduct")) {
            //退货商品
            var jCalcReturnProduct = calcReturnProducts(jOrder, request);
            var totalPrice = new selfApi.BigDecimal(jCalcReturnProduct.optLong("totalPrice"));
            var totalProductRefundPrice = jCalcReturnProduct.optLong("totalProductRefundPrice");
            var jReturnProducts = jCalcReturnProduct.optJSONObject("returnProducts");

            var fTotalProductRefundPrice = selfApi.PriceUtil.divide100(new selfApi.BigDecimal(totalProductRefundPrice));

            var operatorInfo = new selfApi.JSONObject();
            operatorInfo.put("operatorId", jUser.optString("id"));
            operatorInfo.put("operator", selfApi.UserUtil.getRealName(jUser));
            jOrder.put("operatorInfo", operatorInfo);
            //退款意向
            var jRefundInfo = calcRefundInfo(jOrder, refundInfo, totalProductRefundPrice, totalPrice);

            var jDeliveryInfo = new selfApi.JSONObject();
            var deliveryType = new selfApi.JSONObject();
            if (skuWay.equals("0")) {
                deliveryType.put("name", "上门提货");
                deliveryType.put("value", 0);
            } else {
                deliveryType.put("name", "客户寄回");
                deliveryType.put("value", 1);
            }
            var jDeliveryPayer = new selfApi.JSONObject();
            jDeliveryPayer.put("name", "商家");
            jDeliveryPayer.put("value", "0");

            jDeliveryInfo.put("deliveryType", deliveryType);
            jDeliveryInfo.put("deliveryPayer", jDeliveryPayer);
            jDeliveryInfo.put("userName", contactPerson);
            jDeliveryInfo.put("mobile", mobilePhone);

            var duty = new selfApi.JSONObject();   //责任归属
            if (!selectReason.equals("re_50001")) {
                duty.put("name", mallName);
                duty.put("value", 0);
            } else {
                duty.put("name", "客户责任");
                duty.put("value", 1);
            }

            var reason = selfApi.AfterOrderHelper.getResponsibilityDesc(selectReason);

            var jReturnOrderInfo = new selfApi.JSONObject();
            jReturnOrderInfo.put("orderId", orderId);
            jReturnOrderInfo.put("afterSource", selfApi.AfterServiceConstant.RETURN_ORDER_SOURCE_ORDER);
            jReturnOrderInfo.put("products", jReturnProducts);
            jReturnOrderInfo.put("deliveryInfo", jDeliveryInfo);
            jReturnOrderInfo.put("duty", duty);
            jReturnOrderInfo.put("reason", reason);
            jReturnOrderInfo.put("refundInfo", jRefundInfo);
            jReturnOrderInfo.put("remark", "");
            jReturnOrderInfo.put("cusRemark", cusRemark);
            jReturnOrderInfo.put("dDeliveryPrice", "0");
            jReturnOrderInfo.put("totalRefundPrice", fTotalProductRefundPrice);
            jReturnOrderInfo.put("totalExpensePrice", fTotalProductRefundPrice);

            var jConfig = new selfApi.JSONObject();
            jConfig.put("isNeedApprove", true);
            jConfig.put("isNeedCheckRefundInfo", true);

            var jResult = selfApi.ReturnOrderAddUtil.addReturnOrder(userId, jReturnOrderInfo, jConfig);
            if (jResult.optString("code").equals("0")) {
                out.print("ok");
                return;
            } else {
                out.print(jResult.optString("msg"));
                return;
            }
        }


        ret.state = true;
        ret.errorCode = "";
        out.print("系统异常！");
    //}catch(e){
    //    ret.state = false;
    //    ret.errorCode = "system_error";
    //    out.print(JSON.stringify(ret));
    //    $.log(e);
    //}
})();