//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import Info.js
//#import user.js
//#import search.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/likeQuery.jsx
//#import $articleCommentLike:services/commentQuery.jsx
(function () {
    var merchantId = $.params["m"];
    var loginId = $.params["loginId"] || "";
    var articleTitle = $.params["articleTitle"] || "";
    var currentPage = $.params["page"];
    var columnId = $.params["columnId"] ||  InformationService.getInfoColumnId();
    var likePrefix = "acl_management2_like";
    var collectPrefix = "acl_management2_collection_";
    if (!currentPage) {
        currentPage = 0;
    }

    var search  = function (articleId) {
        var searchParams = {};
        var num = 0;
        searchParams.articleId = articleId;
        var searchArgs = {
            fetchCount: -1,
            fromPath: 0
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
        num = result.searchResult.getTotal();
        return num;
    };



    var recordType = "文章数";
    var pageLimit = 10;
    var displayNum = 10;
    var searchParams = {};
    //关键字
    if (articleTitle && articleTitle != "") {
        searchParams.title = articleTitle;
    }
    searchParams.publishState = 1;
    searchParams.path = columnId;
    var currentPage1 = (currentPage -1) *pageLimit ;
    var infoList = InfoService.searchInfo(searchParams,currentPage1,pageLimit);
    var totalRecords = infoList.total;
    infoList = infoList.recordList;
     for(var g = 0; g < infoList.length; g++){
         var articleId = infoList[g].id.replace("_hd","");
         var likeId = likePrefix+articleId;
         var likeObj = commentLikeService.getById(likeId);
         var collectId = collectPrefix+articleId;
         var collectObj = commentLikeService.getById(collectId);
         infoList[g].likes = 0;
         infoList[g].collections = 0;
         if(likeObj){
             infoList[g].likes = likeObj.likes;
         }
         if(collectObj){
             infoList[g].collections = collectObj.collections;
         }
         infoList[g].browse = InformationService.getBrowseCountById(articleId);
         infoList[g].commnents = search(articleId);
         infoList[g].columnName =ColumnService.getColumn(infoList[g].columnId).title;
         infoList[g].articleId = articleId;
     }
    var totalPages = Math.ceil(totalRecords / pageLimit);
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
        resultList: infoList
    };
    var template = $.getProgram(appMd5, "pages/load_articleList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

