//#import Util.js
//#import login.js
//#import product.js
//#import file.js
//#import viewAlsoView.js
//#import inventory.js
//#import commend.js
//#import price.js
//#import login.js
//#import cart.js

(function (processor) {
    processor.on("#header.topNav1_login",function(pageData,dataIds,elems){
        var user = LoginService.getFrontendUser();
        if(user==null){
            pageData.alreadyLogin = false;
            return;
        }
        else{
            pageData.alreadyLogin = true;
        }
        var userName = "";
        if(user.realName){
            userName = user.realName;
        }
        else if(user.nickName){
            userName = user.nickName;
        }
        else if(user.loginId){
            userName = user.loginId;
        }
        else{
            userName = user.id;
        }
        pageData.userId=user.id;
        for(var i=0;i<elems.length;i++){
            var elem = elems[i];
            var dataId = dataIds[i];
            elem = elem.replace("{userName}",userName);
            setPageDataProperty(pageData,dataId,elem);
        }

    });
    processor.on("all", function (pageData, dataIds, elems) {
        var user = LoginService.getFrontendUser();
        var alreadyLogin = false, loggedUserName = "";
        if (user != null) {
            alreadyLogin = true;
            if (user.realName) {
                loggedUserName = user.realName;
            } else if (user.loginId) {
                loggedUserName = user.loginId;
            } else {
                loggedUserName = user.id;
            }
        }
        pageData["alreadyLogin"] = alreadyLogin;
        pageData["loggedUserName"] = loggedUserName;
        /*setPageDataProperty(pageData,"alreadyLogin",alreadyLogin);
         setPageDataProperty(pageData,"loggedUserName",loggedUserName + "");*/
    });
    processor.on("#viewAlsoView", function (pageData, dataIds, elems) {
        //获取买过又买的数据
        var viewAlsoView = [];
        var mid = "head_merchant";
        var carts = CartService.getCarts();
        var productIds = [];
        if (carts && carts.length > 0) {
            for(var i = 0; i<carts.length; i++){
                var items = carts[i].items;
                for (key in items) {
                    var item = items[key];
                    productIds.push(item.productId);
                }
            }
        }
        if(productIds.length>0){
            var productIdsString = productIds.join(",");
            var viewAlsoViewIds = ViewAlsoViewService.getViewAlsoView(productIdsString);
            var effectiveProductIds = [];
            var n = 6;
            if(n>viewAlsoViewIds.size()){
                n = viewAlsoViewIds.size();
            }
            for(var i = 0; i < n; i++){
                effectiveProductIds.push("" + viewAlsoViewIds.get(i));
            }
            var products = ProductService.getProducts(effectiveProductIds,"180X180");
            viewAlsoView = products.map(function(product){
                var newProduct = {};
                newProduct.id = product.objId;
                newProduct.name = product.name;
                newProduct.sellingPoint = product.sellingPoint;
                newProduct.merchantId = product.merchantId;

                newProduct.marketPrice = ProductService.getMarketPrice(product);
                if (newProduct.marketPrice) {
                    newProduct.marketPrice = newProduct.marketPrice.toFixed(2);
                } else {
                    newProduct.marketPrice = "暂无价格";
                }
                newProduct.memberPrice = ProductService.getMemberPrice(product);
                if (newProduct.memberPrice) {
                    newProduct.memberPrice = newProduct.memberPrice.toFixed(2);
                } else {
                    newProduct.memberPrice = "暂无价格";
                }
                newProduct.pics = [product.logo];
                return newProduct;
            });
        }
        //浏览历史
        setPageDataProperty(pageData, "viewAlsoView", viewAlsoView);
    });
})(dataProcessor);