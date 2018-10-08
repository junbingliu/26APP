//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import sysArgument.js
//#import product.js
//#import file.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.org.apache.commons.lang,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.modules.price,
            Packages.net.xinshi.isone.commons,
            Packages.java.util,
            Packages.java.lang,
            Packages.java.math,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order,
            Packages.net.xinshi.isone.modules.order.afterservice,
            Packages.net.xinshi.isone.modules.order.afterservice.tools,
            Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
            Packages.net.xinshi.isone.functions.product
        );

        try{
            var requestURI = request.getRequestURI() + "";
            var userId = "";
            var user = LoginService.getFrontendUser();
            if(user){
                userId = user.id;
            }else{
                response.sendRedirect("/login.html?rurl="+ encodeURI(requestURI + "?" + request.getQueryString()));
            }

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            //var isApplyForReplacement = SysArgumentService.getSysArgumentStringValue(mid,'c_argument_platformKey','isApplyForReplacement');

            var id = request.getParameter("id");
            var jAfterOrder = selfApi.IsoneOrderEngine.afterService.getOrder(id);

            if(jAfterOrder == null){
                response.sendRedirect("/ucenter/return_records.html");
                return;
            }
            if(true){
                var buyerUserId;
                var afterOrder = JSON.parse(jAfterOrder.toString());
                if(afterOrder.buyerInfo){
                    buyerUserId = afterOrder.buyerInfo.userId;
                }

                if((!buyerUserId) || buyerUserId != userId){
                    response.sendRedirect("/ucenter/return_records.html");
                    return;
                }
            }


            var orderType = selfApi.CommonValueUtil.getOrderType(jAfterOrder);
            var orderId = selfApi.CommonValueUtil.getOrderId(jAfterOrder);
            var afterOrderProcessState = selfApi.CommonValueUtil.getApproveState(jAfterOrder);
            var orderTypeName = "换货";
            var totalProgress = "1";
            var totalProcessState = "1";
            var deliveryPrice = "0.00";
            var factRefundPrice = "0.00";
            if (orderType.equals("returnProduct")) {
                orderTypeName = "退货";
                totalProgress = selfApi.ReturnOrderUtil.getTotalProgress(jAfterOrder);
                totalProcessState = selfApi.ReturnOrderUtil.getTotalProcessState(jAfterOrder);
                deliveryPrice = selfApi.PriceUtil.divide100(selfApi.BigDecimal(selfApi.ReturnOrderValueUtil.getTotalReturnDeliveryPrice(jAfterOrder)));
                factRefundPrice = selfApi.ReturnOrderValueUtil.getFormatTotalFactRefundPrice(jAfterOrder);
            } else {
                totalProgress = selfApi.BarterOrderUtil.getTotalProgress(jAfterOrder);
                totalProcessState = selfApi.BarterOrderUtil.getTotalProcessState(jAfterOrder);
                var newReturnOrderAliasCode = selfApi.BarterOrderValueUtil.getBarter2NewReturnOrderAliasCode(jAfterOrder);
                if(selfApi.StringUtils.isBlank(newReturnOrderAliasCode)){
                    newReturnOrderAliasCode = "-";
                }
                var newOrderAliasCode = selfApi.BarterOrderValueUtil.getBarter2NewOrderAliasCode(jAfterOrder);
                if(selfApi.StringUtils.isBlank(newOrderAliasCode)){
                    newOrderAliasCode = "-";
                }
                setPageDataProperty(pageData, "newReturnOrderAliasCode", newReturnOrderAliasCode + "");
                setPageDataProperty(pageData, "newOrderAliasCode", newOrderAliasCode + "");
            }

            var jOrder = selfApi.IsoneOrderEngine.orderService.getOrder(orderId);
            var jStates = selfApi.OrderUtil.getStates(jOrder);
            var processState = selfApi.OrderUtil.getProcessStateValue(jStates);
            var payState = selfApi.OrderUtil.getPayStateValue(jStates);

            var jPriceInfo = selfApi.OrderUtil.getPriceInfo(jOrder);
            var totalOrderRealPrice = selfApi.OrderPriceUtil.getPriceFormatValue(jPriceInfo, selfApi.OrderPriceKey.totalOrderRealPrice);

            var afterOrderMap = {};
            if(jAfterOrder != null){
                afterOrderMap = JSON.parse(jAfterOrder.toString());
                afterOrderMap.createTimeFormat = DateUtil.getLongDate(parseInt(afterOrderMap.createTime));
                if(afterOrderMap.totalExpensePrice){
                    afterOrderMap.totalExpensePriceFormat = selfApi.PriceUtil.getMoneyValue(parseInt(afterOrderMap.totalExpensePrice)) + "";
                }


                var itemList = selfApi.OrderHelper.getNewItemsWithChildItemsWithPresent(jAfterOrder);
                afterOrderMap.itemList = JSON.parse(itemList.toString());
                for(var j=0;j<afterOrderMap.itemList.length;j++){
                    var item = afterOrderMap.itemList[j];
                    //$.log(item.toSource())
                    //var jProductVersion = selfApi.ProductFunction.getProduct(item.productId,item.productVersionId);
                    //item.productVersion = JSON.parse(jProductVersion.toString());
                    var orderProduct = ProductService.getProduct(item.productId);
                    var pics=ProductService.getPics(orderProduct);
                    var realPics=[];
                    for(var k=0;k<pics.length;k++){
                        var relatedUrl=FileService.getRelatedUrl(pics[k].fileId,"90X90");
                        realPics.push(relatedUrl);
                    }
                    orderProduct.pics = realPics;
                    item.orderProduct = orderProduct;

                    var refundPrice = item.priceInfo.refundPrice;
                    if(refundPrice > 0){
                        item.priceInfo.fRefundPrice = selfApi.PriceUtil.getMoneyValue(parseInt(refundPrice)) + "";
                    }

                }


            }


            setPageDataProperty(pageData, "returnOrderId", id + "");
            setPageDataProperty(pageData, "orderType", orderType + "");
            setPageDataProperty(pageData, "orderTypeName", orderTypeName + "");
            setPageDataProperty(pageData, "totalProgress", totalProgress + "");
            setPageDataProperty(pageData, "intTotalProgress",  parseInt(totalProgress+""));
            setPageDataProperty(pageData, "totalProcessState", totalProcessState + "");
            //request.setAttribute("afterOrder", jAfterOrder);
            setPageDataProperty(pageData, "afterOrderMap", afterOrderMap);
            setPageDataProperty(pageData, "deliveryPrice", deliveryPrice + "");
            setPageDataProperty(pageData, "factRefundPrice", factRefundPrice + "");
            setPageDataProperty(pageData, "afterOrderProcessState", afterOrderProcessState.getDesc() + "");

            //request.setAttribute("jOrder", jOrder);
            setPageDataProperty(pageData, "orderMap", JSON.parse(jOrder.toString()));
            setPageDataProperty(pageData, "orderProcessState", processState.getDesc() + "");
            setPageDataProperty(pageData, "orderPayState", payState.getDesc() + "");
            setPageDataProperty(pageData, "totalOrderRealPrice", totalOrderRealPrice + "");

            setPageDataProperty(pageData, "requestURI", requestURI + "");
            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "user", user);
            //setPageDataProperty(pageData, "isApplyForReplacement", isApplyForReplacement);



        }catch (e){
            $.log(e);
        }




    });
})(dataProcessor);