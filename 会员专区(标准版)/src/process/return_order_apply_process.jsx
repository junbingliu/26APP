//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import order.js
//#import address.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.org.apache.commons.lang,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.commons,
            Packages.java.util,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.user,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.modules.order.bean,
            Packages.net.xinshi.isone.modules.order.afterservice,
            Packages.net.xinshi.isone.modules.order,
            Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
            Packages.net.xinshi.isone.functions.product,
            Packages.net.xinshi.pigeon.adapter
        );

        function getNewItemsWithChildItems(jOrder) {
            var items = new selfApi.HashMap();
            var childrenItems = new selfApi.HashMap();
            var jItems = selfApi.OrderUtil.getItems(jOrder);
            for (var i = 0; i < jItems.length(); i++) {
                var item = jItems.optJSONObject(i);
                var parentItemId = item.optString("parentItemId");
                var add2Normal = true;
                if (selfApi.OrderItemUtil.checkItemIsPresent(item)) {
                    add2Normal = false;
                }

                if (!add2Normal) {
                    var childrenItemValue = childrenItems.get(parentItemId);
                    if (childrenItemValue == null) {
                        childrenItemValue = new selfApi.JSONArray();
                    }
                    childrenItemValue.put(item);
                    childrenItems.put(parentItemId, childrenItemValue);
                } else {
                    items.put(item.optString("itemId"), item);
                }
            }
            var jsonArray = new selfApi.JSONArray();
            //var itemsKeySet = items.keySet();
            for (var it = items.entrySet().iterator();it.hasNext();) {
                var entry = it.next();
                var key = entry.getKey();
                var item = entry.getValue();
                var childrenItem = childrenItems.get(key);
                if (childrenItem == null) {
                    childrenItem = new selfApi.JSONArray();
                }
                item.put("childrenItems", childrenItem);
                jsonArray.put(item);
            }

            return JSON.parse(jsonArray.toString());
        }

        try{
            var requestURI = request.getRequestURI() + "";
            var userId = "";
            var user = LoginService.getFrontendUser();
            if(user){
                userId = user.id;
            }else{
                response.sendRedirect("/login.html?rurl=/ucenter/return_order.html");
            }

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            var isApplyForReplacement = SysArgumentService.getSysArgumentStringValue(mid,'c_argument_platformKey','isApplyForReplacement');


            var returnPolicyList = [];
            var strReturnPolicy = selfApi.StaticPigeonEngine.pigeon.getFlexObjectFactory().getContent("config_ReturnPolicy_100");
            if (selfApi.StringUtils.isNotBlank(strReturnPolicy)) {
                var jReturnPolicy = new selfApi.JSONObject(strReturnPolicy);
                var jReturnPolicyValues = jReturnPolicy.optJSONArray("values");
                if (jReturnPolicyValues != null) {
                    returnPolicyList = JSON.parse(jReturnPolicyValues.toString());
                }
            }

            var orderId = $.params.id;
            var order = OrderService.getOrder(orderId);
            var javaOrder = $.toJavaJSONObject(order);
            var newItems = [],newItemsCount = 0;
            if (orderId.indexOf("refund") > -1) {
                newItems = order.newItems;
            }else{
                newItems = getNewItemsWithChildItems(javaOrder);
                for(var k =0;k<newItems.length;k++){
                    if (selfApi.OrderItemUtil.checkItemIsVirtual($.toJavaJSONObject(newItems[k]))) {
                        newItems.splice(k,1);;
                        k--;
                        continue;
                    }
                }
            }
            newItemsCount = newItems.length;

            for(var ix =0;ix<newItems.length;ix++){
                var item = newItems[ix];
                var orderProduct = ProductService.getProduct(item.productId);
                var pics = ProductService.getPics(orderProduct);
                var realPics=[];
                for(var k=0;k<pics.length;k++){
                    var relatedUrl=FileService.getRelatedUrl(pics[k].fileId,"90X90");
                    realPics.push(relatedUrl);
                }
                orderProduct.pics = realPics;
                item.orderProduct = orderProduct;

                var amount = item.amount;
                var needAmount = item.chooseAmount;
                if (!needAmount) {
                    needAmount = amount;
                }
                item.needAmount = needAmount;

            }

            var isCanReturn = selfApi.AfterReturnOrderHelper.canDoReturn(javaOrder);
            var isCanBarter = selfApi.AfterBarterOrderHelper.canDoBarter(javaOrder);
            var addressList = AddressService.getAllAddresses(userId);




            setPageDataProperty(pageData, "requestURI", requestURI + "");
            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "user", user);
            setPageDataProperty(pageData, "order", order);
            setPageDataProperty(pageData, "newItems", newItems);
            setPageDataProperty(pageData, "newItemsCount", newItemsCount);
            setPageDataProperty(pageData, "isApplyForReplacement", isApplyForReplacement);
            setPageDataProperty(pageData, "isCanReturn", isCanReturn);
            setPageDataProperty(pageData, "isCanBarter", isCanBarter);
            setPageDataProperty(pageData, "addressList", addressList);
            setPageDataProperty(pageData, "returnPolicyList", returnPolicyList);

            var token = GenToken.get("returnOrderToken");
            setPageDataProperty(pageData, "token", token);

        }catch (e){
            $.log(e);
        }




    });
})(dataProcessor);