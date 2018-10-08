//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import $oleMemberClass:services/OleMemberClassService.jsx
//#import $oleMemberClass:services/OleMemberClassQuery.jsx

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
    var recordType = "会员活动";
    var pageLimit = 20;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var recordList = [];
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

        searchArgs.queryArgs = OleMemberClassQuery.getQueryArgs(searchParams,"activity");
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            if(objId){
                var record = OleMemberClassService.getActivity(objId);
                if (record) {
                    recordList.push(record);
                }
            }

        }
    } else {
        totalRecords = OleMemberClassService.getActivityListSize("all");
        recordList = OleMemberClassService.getActivityList("all", start, pageLimit);
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

    var pageData = {
        merchantId: merchantId,
        pageParams: pageParams,
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/activity/load_activity.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

