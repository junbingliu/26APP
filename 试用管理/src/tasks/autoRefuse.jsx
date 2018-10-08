//#import Util.js
//#import login.js
//#import DateUtil.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $oleMobileApi:server/util/TryUseUtil.jsx

(function () {
    if ($.params && $.params.activeId) {
        var activeId = $.params.activeId;
    }
    if (typeof activeId == "undefined") {
        return;
    }
    $.log(".................一定时间后，自动将审核申请名单改成审核不通过," + activeId);

    var activeObj = tryOutManageServices.getById(activeId);
    if (!activeObj) {
        $.log("活动不存在," + activeId);
        return;
    }
    //删除旧task
    var oldTaskId = tryOutManageServices.getTaskId(activeId);
    if (oldTaskId) {
        JobsService.deleteTask(oldTaskId);
    }
    var endTime = activeObj.endTime;
    endTime = parseInt(DateUtil.getLongTime(endTime)) + 14 * 24 * 60 * 60 * 1000;
    $.log(".............endTime:" + endTime + ",now:" + (new Date().getTime()));
    //如果结束时间加上14天 大于 当前时间，则证明时间还没到，我们将它重新加入task
    if (endTime > new Date().getTime()) {
        $.log(".............." + activeId + "，还没有到task自动执行时间,重新加task");
        var postData = {
            activeId: activeId
        };
        //重新加入到task队列
        var taskId = JobsService.submitTask(appId, "tasks/autoRefuse.jsx", postData, endTime);
        tryOutManageServices.saveTaskId(taskId, activeId);
        return;
    }
    var ids = searchUnApprovalUserCount(activeId);
    if (ids && ids.size() > 0) {
        for (var i = 0; i < ids.size(); i++) {
            var id = ids.get(i);

            var obj = TrialProductService.getObject(id);
            if (obj.state == "2") {
                obj.state = "0";
                obj.controlUser = "u_0";
                obj.applicationTime = new Date().getTime();
                obj.remarks = "系统自动审核不通过";
                TrialProductService.update(obj.id, obj);
            }
        }
    } else {
        $.log("................." + activeId + ",没有未审核的名单");
    }
})();

function searchUnApprovalUserCount(activeId) {
    var searchParams = {};
    searchParams.activeId = activeId;
    searchParams.state = "2";
    var searchArgs = {
        fetchCount: 99999,
        fromPath: 0
    };
    var qValues = trialProductQuery.getQuery(searchParams);
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
    var result1 = SearchService.search(searchArgs);
    return result1.searchResult.getLists();
}