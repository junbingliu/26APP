//#import doT.min.js
//#import Util.js
//#import product.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx
/**
 * 根据活动id获取到对应的商品列表
 */
(function () {
    var merchantId = $.params["m"];
    var activeId = $.params["activeId"] || "";
    var productList = [];
    var pageData = {
        merchantId: merchantId
    };
    pageData.activeId = activeId;
    var searchParams = {};
    searchParams.activeId = activeId;
    var searchArgs = {
        fetchCount: 30,
        fromPath: 0
    };
    var qValues = tryOutProductQuery.getQuery(searchParams);
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    var ids = result.searchResult.getLists();
    for (var i = 0; i < ids.size() ; i++) {
        var objId = ids.get(i);
        var productObj = tryOutManageServices.getProductObj("",objId);
        if(productObj){
            productList.push(productObj);
        }
    }
    pageData.productList = productList;
   out.print(JSON.stringify(pageData));
})();