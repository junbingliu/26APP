//#import excel.js
//#import Util.js
//#import column.js
//#import DateUtil.js
//#import sysArgument.js
//#import $lotteryEventManage:services/LotteryLogService.jsx

(function () {
    var isSearch = false;

    var merchantId = $.params["m"];
    var eventId = $.params["activity"] || "";

    var totalRecords = 0;
    var resultList = [];
    var tempResult;

    if (eventId != "") {
        isSearch = true;
    }
    if (isSearch) {
        resultList =searchA(eventId);
    }
    var export_fileName =  $.params["fileName"] || "";
    var fileName = export_fileName ? export_fileName : DateUtil.getLongDate(new Date());
    var export_file_type = "channel_lotteryLogList";
    var index = 0;

    var titleList = [
        {"index": index++, "columnWidth": "15", "field": "shopName", "title": "活动门店"},
        {"index": index++, "columnWidth": "30", "field": "eventName", "title": "活动名称"},
        {"index": index++, "columnWidth": "20", "field": "activityGrade", "title": "奖项等级"},
        {"index": index++, "columnWidth": "30", "field": "prizeName", "title": "奖品名称"},
        {"index": index++, "columnWidth": "15", "field": "userName","title": "用户名"},
        {"index": index++, "columnWidth": "25", "field": "mobile", "title": "联系方式"},
        {"index": index++, "columnWidth": "25", "field": "verificationCode", "title": "验证码"},
        {"index": index++, "columnWidth": "15", "field": "createTime", "title": "创建时间"},
    ];
    Excel.createExcelList(merchantId,fileName, export_file_type, titleList, resultList);
    var pageData = {
        state: "ok",
        msg: fileName
    };
    out.print(JSON.stringify(pageData));






    function searchA(eventId){
        var isSearch = false;
        var searchParams = {};
        //关键字
        if (eventId && eventId != "") {
            searchParams.eventId = eventId;
            isSearch = true;
        }
        var pageLimit =8;

        var listData = [];
        if (isSearch) {
            //进入搜索
            var searchArgs = {
                fetchCount: 10,
                fromPath: 0
            };
            searchArgs.sortFields = [{
                field:"createTime",
                type:'LONG',
                reverse:true
            }];

            searchArgs.queryArgs = LotteryLogQuery.getQueryArgs(searchParams);
            var result = SearchService.search(searchArgs);
            var totalRecords = result.searchResult.getTotal();
            var ids = result.searchResult.getLists();

            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var record = LotteryLogService.get(objId);
                if (record) {
                    listData.push(record);
                }
            }
        }
        return listData;
    }
})();

