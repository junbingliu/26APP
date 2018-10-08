//#import Util.js
//#import product.js
//#import column.js
//#import price.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import sysArgument.js
//#import search.js
//#import login.js
//#import file.js
//#import DateUtil.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/ProductLikeUtilService.jsx
//#import $oleMobileApi:services/FavoriteGoodsService.jsx
//#import $tryOutManage:services/tryOutProductQuery.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var imageSize = $.params["imageSize"] || "250X250";
    var activeId = $.params["activeId"];
    var productList = [];
    if(activeId.indexOf("tryOutManage_") == -1){
        activeId = "tryOutManage_"+activeId;
    }
    var obj = tryOutManageServices.getById(activeId);
    if(!obj){
        ret.data = {

        }
    }
    var loginId = LoginService.getFrontendUserId();
    if(obj.state == "1"){
    var searchParams = {};
    searchParams.activeId = activeId;
    searchParams.state = "1";
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
        field: "priority",
        type: "STRING",
        reverse: false
    },{
        field: "createTime",
        type: "LONG",
        reverse: false
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    var ids = result.searchResult.getLists();
    if(ids.size() > 0){
        for (var i = 0; i < ids.size() ; i++) {
            var objId = ids.get(i);
            var productObj = tryOutManageServices.getProductObj("",objId);
            if(productObj){
                if(productObj.marketPrice){
                    productObj.memberPrice = productObj.marketPrice;//将会员价设置成后台的市场价
                }
                productList.push(productObj);
            }
        }
    }
    }else{
        obj = {};
    }
    if(obj.headImageFileId){
        obj.headImage = FileService.getRelatedUrl(obj.headImageFileId,"750X420");
        var endTime = DateUtil.getLongTimeByFormat(obj.endTime,"yyyy-MM-dd HH:mm");
        obj.distanceEnd = endTime - new Date().getTime();//距离结束时间
    }
    var data = {
        activeObj:obj,
        productList:productList
    };
    ret.data = data;
    out.print(JSON.stringify(ret));
})();
