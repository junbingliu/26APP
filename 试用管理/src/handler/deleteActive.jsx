//#import Util.js
//#import login.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx

/**
 * 删除一个活动，顺便把他名下的商品全部删除
 */

(function () {
    var id = $.params["id"] || "";
    var userId = LoginService.getBackEndLoginUserId();
    data = tryOutManageServices.delete(id);
        var searchParams = {};
        //搜索条件为活动id
        searchParams.activeId = id;
        var searchArgs = {
            fetchCount: 50,
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
            var productObj = tryOutManageServices.getById(objId);
            if(productObj){
                //删除商品
                tryOutManageServices.deletePro(objId);
            }
        }
        var ret = {
          state:"ok"
        };
        out.print(JSON.stringify(ret));
})();