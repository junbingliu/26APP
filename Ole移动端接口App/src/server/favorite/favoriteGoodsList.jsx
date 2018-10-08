//#import Util.js
//#import login.js
//#import product.js
//#import pigeon.js
//#import user.js
//#import PreSale.js
//#import inventory.js
//#import NoticeNotify.js
//#import $oleMobileApi:services/FavoriteProductTypeService.jsx
//#import @server/util/CommonUtil.jsx
//#import price.js
;(function () {
    //获取收藏夹商品信息接口
    //返回函数
    //获取会员价
    //ProductService.getMemberPriceByProductId
    //获取实际支付价格
    //ProductService.getRealPayPric
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }
    function getRealPrice(product, userId, userGroups) {

        var price = product.price;
        if (!price) {
            return null;
        }

        for (k in price.values) {
            var skuValues = price.values[k];

            if (userId) {
                var key = ProductService.getPriceValueKey("entitytype_user", userId);
                var prices = skuValues[key];
                if(prices){
                    for (var i = 0; i < prices.length; i++) {
                        var p = prices[i];
                        if (p.payable == 'Y' && p.moneyTypeId == 'moneytype_RMB' && p.direction == '0') {
                            return p;

                        }
                    }
                }

            }
            if (userGroups) {
                for(var userGroupsKey in userGroups){
                    var userGroup = userGroups[userGroupsKey];

                    var key = ProductService.getPriceValueKey("entitytype_usergroup", userGroup.id);
                    var prices = skuValues[key];

                    for (var i = 0; i < prices.length; i++) {
                        var p = prices[i];
                        return p;
                    }
                }

            }


        }

        return null;
    }

    try {
        //var products = $.params.products;
        //var spec = $.params.spec || "200X200";

        var userId = LoginService.getFrontendUserId() || $.params.userId;  //这是顾客的id

        if (!userId) {
            setResultInfo("E1B0001","请先登陆");
            return;
        }
        var userGroups = UserService.getUserGroups(userId);
        var user = UserService.getUser(userId);
        //UserService.getMemberGroupName()
        var favorType = $.params.favorType ;
        if (!favorType) {
            setResultInfo("E1B0001","收藏夹为空");
            return;
        }

        var page = $.params.page || 1;//当前页数
        page = (page - 1) * 15;
        var pageSize = $.params.pageSize || 15;
        var favorProductList = FavoriteProductTypeService.getProductList(favorType,page,pageSize);


        var productArray = [];
        if(favorProductList != null){
            var favorCount = 0;
            for (var i=0; i<favorProductList.length; i++){
                if(!favorProductList[i]){
                    continue;
                }
                var productId = favorProductList[i].productId;
                if(!productId){
                    continue;
                }
                var favorPrice = favorProductList[i].price;

                var product = ProductService.getProduct(productId);
              //  var realPriceObj = getRealPrice(product, userId,userGroups);//获取实际价格对象
                
               

                var skuId = ProductService.getHeadSku(productId).id;
                $.log("=====skuId====" + skuId);
                var skuPrice = CommonUtil.getSkuPrice(product, skuId, userId);
                

                var price = ProductService.getMemberPrice(product);//商品价格

                var productImg = ProductService.getProductLogo(product,"345X370", "");
                var productJson = {};
                var now = new Date().getTime();
                var realPrice = 0;
                productJson.name = product.name;//商品名称
                productJson.skuId = favorProductList[i].skuId || "";
                productJson.price = price.toFixed(2);
                productJson.productId = productId;//商品ID
                realPrice = skuPrice.curPrice.unitPrice;
                productJson.realPrice = realPrice;
                productJson.isSpecialProuct = skuPrice.curPrice.isSpecialPrice;

               
                productJson.imgSrc = productImg;
                //var skus = ProductService.getSkus(productId)

                /**
                var vipLevel = UserService.getUserTopGroupByUserId(userId);
                if(vipLevel){
                    productJson.vipLevel = vipLevel.level;
                }
                 */
                

                productJson.vipLevel = skuPrice.curPrice.curMemberLv;
                //productJson.userGroupName = userGroupName;
                var canBuyCount = InventoryService.getProductSellableCount(product);
                productJson.canBuyCount = canBuyCount;
                if(canBuyCount == 0){
                    productJson.canBuy = false;
                }else {
                    productJson.canBuy = true;
                }

                /**
                var skuObj = ProductService.getHeadSku(productId);
                var skuObj1 = ProductService.getSku(productId,"123456789");
                var skuObj2 = ProductService.getSku(productId,"sku_200067");
                setResultInfo("S0A00000", "success", {
                    "product": skuObj,
                    "skuObj1": skuObj1,
                    "skuObj2": skuObj2
                });
                return
                 **/
                productJson.differencePrice = Math.round((parseFloat(realPrice) - parseFloat(favorPrice)),2) + "";

                //针对预售商品做相应处理
                var jRule = PreSaleService.getProductPreSaleRule(productId);
                var state = {};
                if (jRule) {


                    var now = Date.now();
                    if (now < Number(jRule.depositBeginLongTime)) {
                        state = {code: "0", des: "预售未开始", now: now};
                    }
                    if (now > Number(jRule.depositBeginLongTime) && now < Number(jRule.depositEndLongTime)) {
                        state = {code: "1", des: "订金支付时间", now: now};
                    }
                    if (now > Number(jRule.beginLongTime) && now < Number(jRule.endLongTime)) {
                        state = {code: "2", des: "尾款支付时间", now: now};
                    }
                    if (now > Number(jRule.endLongTime)) {
                        state = {code: "3", des: "预售活动结束", now: now};
                    }
                    jRule.beginLongTimeDif = (Number(jRule.beginLongTime) - now) + "";
                    jRule.endLongTimeDif = (Number(jRule.endLongTime) - now) + "";
                    jRule.depositBeginLongTimeDif = (Number(jRule.depositBeginLongTime) - now) + "";
                    jRule.depositEndLongTimeDif = (Number(jRule.depositEndLongTime) - now) + "";
                    jRule.items = [];

                    //查看当前绑定状态,用户登录才可以查看预售绑定状态,不登录则不进行这个判断
                    var bindState = {};
                    if (userId) {
                        var bindKey = NoticeNotifyService.getBindKey(productId, "preSale", userId);
                        if (bindKey && bindKey != "null") {
                            bindState = {bindKey: bindKey, state: true, msg: "已设置提醒"};
                        } else {
                            bindState = {bindKey: "", state: false, msg: "未设置提醒"};
                        }
                    }
                    productJson.preSale = true;
                    if(jRule.displayAmount == ""){
                        jRule.displayAmount = 0;
                    }
                    productJson.jRule = jRule;
                    productJson.preSaleState = state;
                }else {
                    productJson.preSale = false;
                    productJson.jRule = {};
                    productJson.preSaleState = state;
                }

                // 添加商品特价相关字段
                productJson.hasSpecialPrice = skuPrice.hasSpecialPrice;
                productJson.specialPirce = skuPrice.hasSpecialPrice ? skuPrice.specialPirce.unitPrice : "";
                if (skuPrice.hasSpecialPrice) {
                    productJson.differencePrice = Math.abs(Math.round((parseFloat(realPrice) - parseFloat(productJson.specialPirce)), 2)) + "";
                }
                productArray.push(productJson);
            }
            var list = FavoriteProductTypeService.getProductList(favorType,0,-1);
            var pageTotal = 0;
            var totalCount = 0;

            if(list){

                totalCount = list.length;
                if(totalCount != 0){
                    pageTotal = parseInt(parseInt(totalCount)/parseInt(pageSize)) + 1;
                }
            }
            setResultInfo("S0A00000", "success", {
                    "favorList": productArray,
                    "pageTotal":pageTotal,
                    "totalCount": totalCount
            });


        }else {
            setResultInfo("S0A00000", "error");
        }

    } catch (e) {
        $.error("获取购物车商品列表失败" + e);
        setResultInfo("E1B0001333","获取购物车商品列表失败" + e);
    }
})();