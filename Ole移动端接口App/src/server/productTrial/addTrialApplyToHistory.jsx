//#import Util.js
//#import jobs.js
//#import eventBus.js
//#import pigeon.js
//#import jobs.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/BlackListReason.jsx
//#import $oleMobileApi:services/TrialListService.jsx

(function () {
    $.log("\n\n -------->2 trialId = " + trialId + "\n\n");
    if (typeof trialId == "undefined") {
        $.log("有参数为空");
        return;
    }
    $.log("\n\n -------->3 id = " + trialId + "\n\n");
    var queryAttr = [];
    queryAttr.push({n: "ot", v: "ole_trial_product_ot_index", type: 'term'});
    queryAttr.push({n: 'id', v: trialId, type: 'text', op: 'and'});

    var sortFields = {
        field: "createTime",
        type: "LONG",
        reverse: true
    };

    var searchArgs = {
        fetchCount: 1,
        fromPath: 0,
        sortFields: [
            sortFields],
        queryArgs: JSON.stringify({
            mode: "adv",
            q: queryAttr
        })
    };

    var result = SearchService.search(searchArgs);
    var allCount = result.searchResult.getTotal();  //所有通过关键词查询到的数量
    var idsJavaList = result.searchResult.getLists(); //实际获取的查询出的Id

    $.log("\n\n allCount = " + allCount + "\n\n");
    $.log("\n\n idsJavaList = " + idsJavaList.size() + "\n\n");

    var ids = [];

    for (var i = 0, len = idsJavaList.size(); i < len; i++) {
        var id = idsJavaList.get(i) + "";
        if (id) {
            ids.push(id);
        }
    }
    var list = TrialListService.getListByIds(ids);

    var trialApplyObj = list[0];
    trialApplyObj.isHistory = "1";//修改为历史订单
    $.log("\n\n trialApplyObj.isHistory"+ trialApplyObj.isHistory + "\n\n");
    TrialListService.saveObj(trialApplyObj.id, trialApplyObj); // 保存对象

    var jobPageId = "jobs/TrialProductIndexJob.jsx";
    JobsService.runNow("oleMobileApi", jobPageId, {ids: trialApplyObj.id});

})();