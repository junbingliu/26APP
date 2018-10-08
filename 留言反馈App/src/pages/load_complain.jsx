//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import $oleComplaintApp:services/OleComplainQuery.jsx

(function () {


    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }

    var isSearch = false;
    var searchParams = {};
    //关键字
    if (keyword && keyword != "") {
        searchParams.keyword = keyword;
        isSearch = true;
    }

    //分页参数 begin
    var recordType = "留言";
    var pageLimit = 20;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var recordList = [];
    var newList=[];
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        searchArgs.sortFields = [{
            field: "createTime",
            type: 'LONG',
            reverse: true
        }];

        searchArgs.queryArgs = OleComplainQuery.getQueryArgs(searchParams);
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            if(objId){
                var record = OleComplainService.getComplaint(objId);
                if (record) {
                    recordList.push(record);
                }
            }

        }
    } else {
        totalRecords = OleComplainService.getComplaintListSize("all");
        recordList = OleComplainService.getComplaintList("all", start, pageLimit);
    }

    //日期格式化
    for (var k = 0; k < recordList.length; k++) {
        var jLog = recordList[k];
        if (jLog){
            jLog.formatCreateTime = DateUtil.getLongDate(jLog.createTime);
            jLog.objId = jLog.objId || "";
            newList.push(jLog);
        }
    }


    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: recordType,
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };

    if(newList&&newList.length>0){
        recordList=newList;
    }
    var pageData = {
        merchantId: merchantId,
        pageParams: pageParams,
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/load_complain.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

