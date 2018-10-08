//#import Util.js
//#import column.js
//#import product.js
//#import search.js
//#import @server/util/ErrorCode.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/reportModelQuery.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var productObjId = $.params["productObjId"];
    var product = {};
    var productObj = {}
    if(productObjId.indexOf("tryOutManage") > -1){
         productObj = tryOutManageServices.getProductObj("",productObjId);
         product = ProductService.getProduct(productObj.id);
    }else{
        product = ProductService.getProduct(productObjId);
    }
    var columnId = product.columnId;
    var searchArgs = {
        fetchCount: 99999,
        fromPath: 0
    };
    var qValues = reportModelQuery.getQuery({columnIds:columnId});
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
    var totalRecords = result.searchResult.getTotal();
    var ids = result.searchResult.getLists();
    if(totalRecords > 0){
        var objId = ids.get(0);
        var obj = tryOutManageServices.getById(objId);
        delete obj["columnIds"];
        ret.data = obj;
    }else{
        var g = {};
        g.statement1 = "#一句话试用总结#";
        g.statement2 = "收到时的心情";
        g.statement3 = "该商品的口感如何";
        g.statement4 = "和你用过的商品相比较";
        g.statement5 = "自由发言...";
        ret.data = g;
    }
    out.print(JSON.stringify(ret));
})();