//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import Info.js
//#import user.js
//#import search.js
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/commentQuery.jsx
(function () {
    var merchantId = $.params["m"];
    var articleId = $.params["articleId"] || "";
    var loginId = $.params["loginId"] || "";
    var currentPage = $.params["page"];
    var resultList = [];
    if (!currentPage) {
        currentPage = 1;
    }

    var isSearch;
    var searchParams = {};
    //关键字
        searchParams.articleId = articleId;
        isSearch = true;
    if (loginId && loginId != "") {
        searchParams.loginId = loginId;
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "评论";
    var pageLimit = 10;
    var displayNum = 10;
    var start = (currentPage - 1) * pageLimit;
    var totalRecords = commentLikeService.listCount();
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        var qValues = commentQuery.getQuery(searchParams);
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
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();
        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = commentLikeService.getById(objId);
            if (record) {
                resultList.push(record);
            }
        }
    } else {
        totalRecords = commentLikeService.listCount();//获取列表总数
        //获得所有记录
        resultList = commentLikeService.list(start, pageLimit);
    }
    function name1(name) {
        var checkinUserName = "";
        if (name.realName) {
            checkinUserName = name.realName;
        } else if(name.nickName){
            checkinUserName = name.nickName;
        }else{
            checkinUserName = name.loginId;
        }
        return checkinUserName;
    }

    var recordList = [];
    for (var h = 0; h < resultList.length; h++) {
        var result1 = resultList[h];
        var infoObj = "";
        if (result1) {
            infoObj = InfoService.getInfo(result1.articleId);
        if (infoObj) {
            result1.articleTitle = infoObj.title || "";
            result1.articleData = infoObj.content || "";
            result1.author = infoObj.author || "";
            var checkinUser = UserService.getUser(infoObj.checkinUser);
            result1.checkinUser = name1(checkinUser) || "";
            result1.articleCreateTime = DateUtil.getLongDate(infoObj.createTime) || "";//文章发表时间
            result1.createTime = DateUtil.getLongDate(result1.createTime) || "";//评论时间
            var comLogin = UserService.getUser(result1.loginId);
            result1.commentator = "";
            if(comLogin){
            result1.commentator = name1(comLogin);
            }
            if (result1.approverId) {
                var approverId = UserService.getUser(result1.approverId);
                result1.approver = name1(approverId) || "";
            }
            if (result1.approvalTime) {
                result1.approvalTime = DateUtil.getLongDate(result1.approvalTime) || "";//审批时间
            }
            recordList.push(result1);
        }
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

    var pageData = {
        merchantId: merchantId,
        pageParams: pageParams,
        resultList: recordList
    };
    var template = $.getProgram(appMd5, "pages/load_CLList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

