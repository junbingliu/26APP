//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import column.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.commons,
            Packages.java.util,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order,
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
                response.sendRedirect("/login.html?rurl="+requestURI);
            }

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            var isApplyForReplacement = SysArgumentService.getSysArgumentStringValue(mid,'c_argument_platformKey','isApplyForReplacement');

            var page = $.params.page || 1;
            var count = 20,keyword = $.params.returnOrderKeyword || "";

            if(true){
                var checkResult = true;
                var pattern = /[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
                for (var i = 0; i < keyword.length; i++) {
                    var val = keyword[i];
                    if(pattern.test(val)){
                        checkResult = false;
                        break;
                    }
                }
                if(!checkResult){
                    keyword = encodeURIComponent(keyword);
                }
            }

            var columnId = selfApi.IOrderService.U_ORDER_LIST_COLUMN_ID_ALL;
            var orderType = selfApi.IOrderService.ORDER_LIST_TYPE_SUCCESS;
            var jRefundMap = selfApi.OrderFunction.getRefundOrderList(userId,columnId,orderType,page ,count ,keyword);
            var refundMap = {};
            if(jRefundMap != null){
                refundMap = JSON.parse(new selfApi.JSONObject(jRefundMap).toString());
                if(refundMap.count > 0){
                    for(var i=0;i<refundMap.lists.length;i++){
                        var refundOrder = refundMap.lists[i];
                        refundOrder.createTimeFormat = DateUtil.getLongDate(parseInt(refundOrder.createTime));
                        var itemList = selfApi.OrderHelper.getNewItemsWithChildItemsWithPresent($.toJavaJSONObject(refundOrder));
                        refundOrder.itemList = JSON.parse(itemList.toString());
                        for(var j=0;j<refundOrder.itemList.length;j++){
                            var item = refundOrder.itemList[j];
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
                        //refundOrder.states.processState.desc = selfApi.OrderState.valueOf(refundOrder.states.processState.state).getBuyerDesc() + "";
                        //refundOrder.states.payState.desc = selfApi.OrderState.valueOf(refundOrder.states.payState.state).getBuyerDesc() + "";
                        refundOrder.states.approvalState.desc = selfApi.OrderState.valueOf(refundOrder.states.approvalState.state).getBuyerDesc() + "";
                        //refundOrder.states.refundState.desc = selfApi.OrderState.valueOf(refundOrder.states.refundState.state).getBuyerDesc() + "";


                    }
                }
            }
            //$.log(refundMap.toSource())


            setPageDataProperty(pageData, "requestURI", requestURI + "");
            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "user", user);
            setPageDataProperty(pageData, "refundMap", refundMap);
            setPageDataProperty(pageData, "page", page);
            setPageDataProperty(pageData, "isApplyForReplacement", isApplyForReplacement);
            setPageDataProperty(pageData, "returnOrderKeyword", keyword);



        }catch (e){
            $.log(e);
        }




    });
})(dataProcessor);