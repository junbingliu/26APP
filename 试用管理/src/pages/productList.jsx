//#import doT.min.js
//#import Util.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx
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
            if(productObj.state == "2"){
                productObj.stateName = "已下架"
            }
            if(productObj.state == "1"){
                productObj.stateName = "已发布"
            }
            if(productObj.state == "3"){
                productObj.stateName = "草稿"
            }
          productList.push(productObj);
        }
    }
    pageData.productList = productList;
    var template = $.getProgram(appMd5, "pages/productList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();