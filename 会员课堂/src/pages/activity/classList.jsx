//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import search.js
//#import $oleMemberClass:services/OleMemberClassService.jsx
//#import $oleMemberClass:services/OleMemberClassQuery.jsx

(function () {


    var merchantId = $.params["m"];
    var currentPage = $.params["page"];
    var activityId=$.params.id;
    if (!currentPage) {
        currentPage = 1;
    }
    var isSearch = false;
    var searchParams = {};
    //关键字
    if (activityId && activityId !== "") {
        searchParams.activityId=activityId;
        isSearch = true;
    }


    var pageLimit = 40;
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

        searchArgs.queryArgs = OleMemberClassQuery.getQueryArgs(searchParams,"class");
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            if(objId){
                var record = OleMemberClassService.getClass(objId);
                if (record) {
                    recordList.push(record);
                }
            }

        }
    }

    var pageData = {
        merchantId: merchantId,
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/activity/classList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

