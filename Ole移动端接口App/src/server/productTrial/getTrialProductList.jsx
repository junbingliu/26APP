//#import Util.js
//#import search.js
//#import product.js
//#import @server/util/ErrorCode.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var start = $.params["start"] || 0;
    var limit = $.params["limit"] || 15;
    var productList = [];
    var searchParams = {};
    searchParams.hasReport = "1";
    var searchArgs = {
        fetchCount: limit,
        fromPath: start
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
        var json = {
          name:  productObj.name,
          productId : productObj.id,
          productObjId:productObj.productObjId,
          productImage : productObj.productImage
        };
        if(productObj){
            productList.push(json);
        }
    }
    ret.data = productList;
    out.print(JSON.stringify(ret));
})();