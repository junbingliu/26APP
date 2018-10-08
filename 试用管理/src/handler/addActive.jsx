//#import Util.js
//#import login.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx

/**
 * 添加修改活动信息
 */

(function () {
    var id = $.params["id"] || "";
    var title  = $.params["title"] || "";
    var beginTime  = $.params["beginTime"] || "";
    var endTime  = $.params["endTime"] || "";
    var description  = $.params["description"] || "";
    var headImage = $.params["headImage"] || "";
    var headImageFileId = $.params["headImageFileId"] || "";
    var state = $.params["state"] || "";
    var channel = $.params["channel"] || "";
    var userId = LoginService.getBackEndLoginUserId();
    var data = {
        id:id,
        title:title,
        beginTime:beginTime,
        endTime:endTime,
        headImage:headImage,
        description:description,
        state:state,
        responsible:userId,
        channel:channel && channel.split(","),
        headImageFileId:headImageFileId,
        obj:{a:"b"}
    };
    data = tryOutManageServices.add(data);
    //state等于2时代表活动下架，就把活动下的商品全部下架
    if(state == "2" && id){
        var searchParams = {};
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
        //通过活动id搜索名下的商品
        var result = SearchService.search(searchArgs);
        var ids = result.searchResult.getLists();
        for (var i = 0; i < ids.size() ; i++) {
            var objId = ids.get(i);
            //获取商品对象
            var productObj = tryOutManageServices.getById(objId);
            if(productObj){
                productObj.state = 2;
                productObj.freight = productObj.freight.join(",");
                //把对象商品从活动进行下架
                tryOutManageServices.addProduct(productObj);
            }
        }
    }
    if(data){
        var ret = {
            state:"ok",
            data:data
        };
        out.print(JSON.stringify(ret));
    }
})();