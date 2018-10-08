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
            Packages.net.xinshi.isone.functions.member,
            Packages.net.xinshi.isone.functions.order,
            Packages.net.xinshi.isone.functions.card,
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


        var userGroup = UserService.getUserTopGroupByUserId(userId);
        var accountType = Packages.net.xinshi.isone.modules.account.IAccountService.ACCOUNT_TYPE_SHOPPINGINTEGRAL + "";
        var accountTypeName = UserService.getAccountType(accountType);
        var userAccount = UserService.getUserAccount(userId,accountType);
        var userAccountAmount = 0;
        if(userAccount){
            userAccountAmount = UserService.getObjAmount(userAccount.id,userId) / 100;
        }

        var couponCount = selfApi.CardFunction.getUserAvailableCardCount(userId,'cardType_coupons');


        //最近订单
        var orderColumn = Packages.net.xinshi.isone.modules.order.IOrderService.U_ORDER_LIST_COLUMN_ID_ALL + "";
        var orderType = Packages.net.xinshi.isone.modules.order.IOrderService.ORDER_LIST_TYPE_ALL + "";

        var orderMap = OrderService.getMyOrderList(userId,orderColumn,orderType,1,3);
        if(orderMap.count > 0){
            for(var i=0;i<orderMap.list.length;i++){
                var order = orderMap.list[i];
                order.createTimeFormat = DateUtil.getShortDate(parseInt(order.createTime)) + "";
                var itemList = selfApi.OrderHelper.getNewItemsWithChildItemsWithPresent($.toJavaJSONObject(order));
                order.itemList = JSON.parse(itemList.toString());
                for(var j=0;j<order.itemList.length;j++){
                    var item = order.itemList[j];
                    //$.log(item.toSource())
                    //var jProductVersion = selfApi.ProductFunction.getProduct(item.productId,item.productVersionId);
                    //item.productVersion = JSON.parse(jProductVersion.toString());
                    var orderProduct = ProductService.getProduct(item.productId);
                    var pics=ProductService.getPics(orderProduct);
                    var realPics=[];
                    for(var k=0;k<pics.length;k++){
                        var relatedUrl=FileService.getRelatedUrl(pics[k].fileId,"50X50");
                        realPics.push(relatedUrl);
                    }
                    orderProduct.pics = realPics;
                    item.orderProduct = orderProduct;
                }
                order.states.processState.desc = selfApi.OrderState.valueOf(order.states.processState.state).getBuyerDesc() + "";
                order.states.payState.desc = selfApi.OrderState.valueOf(order.states.payState.state).getBuyerDesc() + "";
                order.states.approvalState.desc = selfApi.OrderState.valueOf(order.states.approvalState.state).getBuyerDesc() + "";
                order.states.refundState.desc = selfApi.OrderState.valueOf(order.states.refundState.state).getBuyerDesc() + "";
                order.isCashOnDelivery = selfApi.OrderHelper.isCashOnDelivery($.toJavaJSONObject(order));
                //$.log(order.states.toSource())
            }
        }


        var page = $.params.page || 1;
        var columnId = $.params.columnId || "";
        var favorType = "product",fTag = "",count = 3;
        var favorMap = {};
        var jFavorMap = selfApi.FavoriteFunction.getMemberProductFavoriteListByPage(userId,favorType,columnId,fTag,page,count);
        if(jFavorMap != null){
            if(jFavorMap.get("count") > 0){
                var productIds = [];
                var lists = jFavorMap.get("lists");
                for(var i=0;i<lists.size();i++){
                    var favor = lists.get(i);
                    favor.put("createTimeFormat",DateUtil.getShortDate(favor.optLong("createTime")));
                    productIds.push(favor.optString("objId") + "");
                }

                var cxt = "{attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true}]}";
                var jContext = new selfApi.JSONObject(cxt);
                var priceContext = jContext.getObjectMap();
                var versionList = ProductApi.IsoneModulesEngine.productService.getListDataByIds(productIds, false);
                versionList = ProductApi.PricePolicyHelper.getPriceValueList(versionList, userId, pageData["_m_"], priceContext, "normalPricePolicy");  //一次性获取商品价格
                versionList = Packages.net.xinshi.isone.modules.filemanagement.ImageRelatedFileUtil.getProductsFirstRelatedSizeImageFullPath(versionList, "90X90", "/upload/nopic_100.jpg");//一次性获取商品大小图
                if(versionList != null){
                    jFavorMap.put("productList",versionList);
                }
            }
            favorMap = JSON.parse(new selfApi.JSONObject(jFavorMap).toString());
            //if(favorMap.columnIdList && favorMap.columnIdList.length > 0){
            //    for(var i=0;i<favorMap.columnIdList.length;i++){
            //        var colObj = favorMap.columnIdList[i];
            //        colObj.columnObj = ColumnService.getColumn(colObj.cId);
            //    }
            //}
        }

        var grade = user.grade;
        if(grade){
            grade = parseInt(grade);
            if(user.checkedemailStatus == "1"){
                grade += 20;
            }
            if(user.checkedphoneStatus == "1"){
                grade += 20;
            }
        }else{
            grade = 20;
        }
        var userGrade = (grade <= 30 ? '低' : userGrade <= 70 ? '中' : '高');

        setPageDataProperty(pageData, "requestURI", requestURI + "");
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "userAccountAmount", userAccountAmount);
        setPageDataProperty(pageData, "couponCount", couponCount);
        setPageDataProperty(pageData, "orderMap", orderMap);
        setPageDataProperty(pageData, "favorMap", favorMap);
        setPageDataProperty(pageData, "userGrade", userGrade);

    });
})(dataProcessor);