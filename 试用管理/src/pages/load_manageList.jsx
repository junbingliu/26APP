//#import doT.min.js
//#import Util.js
//#import login.js
//#import search.js
//#import DateUtil.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/tryOutManageQuery.jsx
(function () {
    var searchParams = {};
    var title = $.params["title"];
    var currentPage = $.params["page"] || 1;
    var num = $.params["num"] || "";
    var merchantId = $.params["m"];
    var resultList = [];

    if(title){
        searchParams.title_text = title;
    }
    if(num){
        searchParams.id = "tryOutManage_"+num
    }

    var recordType = "活动数";
    var pageLimit = 10;
    var displayNum = 6;
    var start = (currentPage - 1) * pageLimit;
    var searchArgs = {
        fetchCount: pageLimit,
        fromPath: start
    };
    var qValues = tryOutManageQuery.getQuery(searchParams);
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
    for (var i = 0; i < ids.size() ; i++) {
        var objId = ids.get(i);
        var record = tryOutManageServices.getById(objId);
        if (record != null) {
            record.period = record.beginTime +"-" + record.endTime;
            if(record.state == "1"){
                record.state = "已发布";
            }else{
                record.state = "已下架";
            }
            record.createTime = DateUtil.getLongDate(record.createTime);
            record.num = record.id.replace("tryOutManage_","");
            resultList.push(record);
        }
    }
    var totalPages = parseInt((totalRecords + pageLimit - 1) / pageLimit);
    var pageParams = {
        recordType: recordType,
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };

    var pageData = {
        merchantId: merchantId,
        pageParams: pageParams,
        resultList: resultList
    };
    var template = $.getProgram(appMd5, "pages/load_manageList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();