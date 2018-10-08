//#import Util.js
//#import file.js
//#import search.js
//#import @server/util/H5CommonUtil.jsx
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutManageQuery.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx

/**
 * 试用列表，试用首页用到，只取最新的六条
 */
(function () {
    //只取最新的六条
    var searchArgs = {
        fetchCount: 6,
        fromPath: 0
    };
    var qValues = tryOutManageQuery.getQuery({state: "1",channel:'h5'});
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    //根据创建时间排序，取最新的六条
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    var ids = result.searchResult.getLists();
    var resultList = [];
    var getApplyCount = function (activeId) {
        var searchParams = {};
        searchParams.activeId = activeId;
        var searchArgs = {
            fetchCount: 1,
            fromPath: 0
        };
        var qValues = trialProductQuery.getQuery(searchParams);
        var queryArgs = {
            mode: 'adv',
            q: qValues
        };
        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var result = SearchService.search(searchArgs);
        return result.searchResult.getTotal();
    };
    for (var i = 0; i < ids.size(); i++) {
        var objId = ids.get(i);
        var record = tryOutManageServices.getById(objId);
        if (record != null) {
            var beginTime = record.beginTime;
            var longTime = DateUtil.getLongTime(beginTime);
            var enDate = DateUtilApi.DateUtil.getLongDate(longTime, "en", "MMM dd");
            var obj = {
                id: record.id,
                title: record.title,//标题
                image: FileService.getFullPath(record.headImageFileId),//活动图片访问路径
                applyCount: getApplyCount(record.id),//获取修改数量
                time: enDate + ""
            };
            resultList.push(obj);
        }
    }
    H5CommonUtil.setSuccessResult(resultList)
})();