//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import order.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {

        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.java.util,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order,
            Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
            Packages.net.xinshi.isone.functions.product
        );


        var requestURI = request.getRequestURI() + "";


        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            response.sendRedirect("/login.html?rurl=" + requestURI);
        }

        var mid = "head_merchant";
        var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
        var isApplyForReplacementValue = SysArgumentService.getSysArgumentStringValue(mid,"c_argument_platformKey","isApplyForReplacement");


        var searchKeyword = $.params.orderKeyword;
        var orderType = $.params.state;
        var startDay = $.params.startDay;
        var option = $.params.option;
        var page = $.params.page;

        var keywordJson = {};
        if (searchKeyword && searchKeyword != "商品名称、订单编号" && searchKeyword != "输入您的订单号") {
            var pattern = selfApi.Pattern.compile("[0-9]*");
            var isNum = pattern.matcher(searchKeyword);
            if (isNum.matches()) {
                keywordJson["aliascode"] = searchKeyword; //订单编号
            }else {
                var checkResult = true;
                var pattern = /[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
                for (var i = 0; i < searchKeyword.length; i++) {
                    var val = searchKeyword[i];
                    if(pattern.test(val)){
                        checkResult = false;
                        break;
                    }
                }
                if(!checkResult){
                    searchKeyword = encodeURIComponent(searchKeyword);
                }
                keywordJson["keyword"] = searchKeyword;
            }
        }
        if (!orderType) {
            orderType = selfApi.IOrderService.ORDER_LIST_TYPE_ALL + "";
        }
        if (!option) {
            option = "new";
        }
        if (!startDay) {
            if (option == "new") {
                startDay = "3600";
            }
        }
        if(!page){
            page = 1;
        }

        var orderColumn = selfApi.IOrderService.U_ORDER_LIST_COLUMN_ID_ALL + "";
        var orderMap = {},jOrderMap = null;
        if(orderType == "br100"){
            jOrderMap = selfApi.OrderFunction.getWaitingBuyerReviewOrderInfo('',userId,'',page,5,startDay,$.toJavaJSONObject(keywordJson),option);
        }else{
            jOrderMap = selfApi.OrderFunction.getUserOrderListSec(userId,orderColumn ,orderType,page ,5 ,startDay, $.toJavaJSONObject(keywordJson),option);
        }
        orderMap = JSON.parse(new selfApi.JSONObject(jOrderMap).toString());

        //var orderMap = OrderService.getMyOrderList(userId,orderColumn,orderType,1,5);

        if(orderMap.count > 0){
            for(var i=0;i<orderMap.lists.length;i++){
                var order = orderMap.lists[i];
                order.createTimeFormat = DateUtil.getLongDate(parseInt(order.createTime)) + "";
                var itemList = selfApi.OrderHelper.getNewItemsWithChildItemsWithPresent($.toJavaJSONObject(order));
                order.itemList = JSON.parse(itemList.toString());
                for(var j=0;j<order.itemList.length;j++){
                    var item = order.itemList[j];
                    //$.log(item.toSource())
                    //var jProductVersion = selfApi.ProductFunction.getProduct(item.productId,item.productVersionId);
                    //item.productVersion = JSON.parse(jProductVersion.toString());
                    var orderProduct = ProductService.getProduct(item.productId);
                    var pics = ProductService.getPics(orderProduct);
                    var realPics=[];
                    for(var k=0;k<pics.length;k++){
                        var relatedUrl=FileService.getRelatedUrl(pics[k].fileId,"90X90");
                        realPics.push(relatedUrl);
                    }
                    orderProduct.pics = realPics;
                    item.orderProduct = orderProduct;
                }
                order.states.processState.desc = selfApi.OrderState.valueOf(order.states.processState.state).getBuyerDesc() + "";
                order.states.payState.desc = selfApi.OrderState.valueOf(order.states.payState.state).getBuyerDesc() + "";
                order.states.approvalState.desc = selfApi.OrderState.valueOf(order.states.approvalState.state).getBuyerDesc() + "";
                order.states.refundState.desc = selfApi.OrderState.valueOf(order.states.refundState.state).getBuyerDesc() + "";

                if(order.states.buyerReviewState){
                    order.states.buyerReviewState.desc = selfApi.OrderState.valueOf(order.states.buyerReviewState.state).getBuyerDesc() + "";
                }

                order.isCashOnDelivery = selfApi.OrderHelper.isCashOnDelivery($.toJavaJSONObject(order));


                if(order.states.processState.state == "p112" && order.states.payState.state == "p201"){
                    //评价数据
                    var jAppraise = selfApi.IsoneCreditEngine.merchantAppraiseService.getAppraise(order.id, order.sellerInfo.merId);
                    if(jAppraise != null){
                        order.appraise = JSON.parse(jAppraise.toString());
                    }

                    //申请售后数据
                    var jOrderOne = $.toJavaJSONObject(order);
                    var isApply = selfApi.IsoneOrderEngine.afterService.execAfterSales(jOrderOne);
                    var orderTypeInfo = selfApi.OrderUtil.getOrderType(jOrderOne);
                    var notDelVouchers = orderTypeInfo != selfApi.OrderType.delVouchers;
                    //JSONArray jPayInfoArr = selfApi.OrderUtil.getPayRecArrayInfo(jOrderOne);
                    //原订单 根据ERP对接结果 不通过状态 可以重新退(换)货
                    var approveStatus = order.approveStatus;
                    var isApproveStatus = false;
                    if (approveStatus && approveStatus == "2") {
                        isApproveStatus = true;
                    }

                    order.approve = {
                        isApply:isApply,
                        isApproveStatus:isApproveStatus,
                        notDelVouchers:notDelVouchers
                    };

                }





            }
        }





        //$.log(orderMap.list)
        setPageDataProperty(pageData, "requestURI", requestURI);
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "orderMap", orderMap);
        setPageDataProperty(pageData, "orderType", orderType);
        setPageDataProperty(pageData, "orderKeyword", searchKeyword);
        setPageDataProperty(pageData, "isApplyForReplacementValue", isApplyForReplacementValue);

    });
})(dataProcessor);