//#import doT.min.js
//#import Util.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import DateUtil.js
//#import search.js
//#import $oleMemberClassSetting:services/AdminService.jsx
//#import $oleMemberClassSetting:services/AdminQuery.jsx

(function () {
    try {
        var m = $.params.m;
        var currentPage = $.params["page"];
        var theMerchantId = $.params["theMerchantId"];
        var adminType = $.params["adminType"];
        var keyword = $.params["keyword"];

        var isSearch = true;
        var searchParams = {};
        //关键字
        if (keyword && keyword != "") {
            searchParams.keyword = keyword;
        }
        if (theMerchantId && theMerchantId != "") {
            searchParams.merchantId = theMerchantId;
        }
        if (adminType && adminType != "") {
            searchParams.adminType = adminType;
        }

        var pageLimit = 20;
        var displayNum = 6;
        var recordType = "管理员";
        if (!currentPage) {
            currentPage = 1;
        }
        var start = (currentPage - 1) * pageLimit;

        var totalRecords = 0;
        var listData = [];
        if(isSearch){
            var searchArgs = {
                fetchCount: pageLimit,
                fromPath: start
            };
            searchArgs.sortFields = [{
                field:"createTime",
                type:'LONG',
                reverse:true
            }];

            searchArgs.queryArgs = AdminQuery.getQueryArgs(searchParams);
            var result = SearchService.search(searchArgs);
            totalRecords = result.searchResult.getTotal();
            var ids = result.searchResult.getLists();

            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i) + "";
                var record = AdminService.getAdmin(objId);
                if (record) {
                    listData.push(record);
                }
            }
        }

        var recordList = [];
        for (var i = 0; i < listData.length; i++) {
            var jRecord = listData[i];
            if (!jRecord) {
                continue;
            }

            var formatCreateTime = "";
            if (jRecord.createTime && jRecord.createTime != "") {
                formatCreateTime = DateUtil.getLongDate(jRecord.createTime);
            }
            jRecord.formatCreateTime = formatCreateTime;

            var createUserName = "";
            var jUser = UserService.getUser(jRecord.createUserId);
            if(jUser){
                createUserName = UserUtilService.getRealName(jUser);
            }
            jRecord.createUserName = createUserName;

            recordList.push(jRecord);
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
            recordList: recordList,
            start: start,
            pageParams: pageParams,
            merchantId: m
        };
        var template = $.getProgram(appMd5, "pages/club/load_records.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e);
    }
})();

