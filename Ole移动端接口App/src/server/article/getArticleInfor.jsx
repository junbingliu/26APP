//#import Util.js
//#import DateUtil.js
//#import Info.js
//#import user.js
//#import search.js
//#import login.js
//#import file.js
//#import @server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/commentQuery.jsx
//#import $articleCommentLike:services/likeQuery.jsx
(function () {
    var articleId = $.params["articleId"] || "";
    var loginId = $.params["loginId"] || $.params["loginId"];
    if(!loginId){
        loginId = LoginService.getFrontendUserId();
    }
    var ret =  ErrorCode.S0A00000;
    var currentPage = $.params["start"] ||1;
    var limit = $.params["limit"] || 10;
    var resultList = [];

    if (!currentPage) {
        currentPage = 1;
    }
    var searchParams = {};
    //关键字
    if (articleId && articleId != "") {
        searchParams.articleId = articleId;
    }
    searchParams.commentType = "0";
    //分页参数 begin
    var pageLimit = limit;
    var start = (currentPage - 1) * pageLimit;
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
            field: "likes",
            type: "STRING",
            reverse: true
        },{
            field: "createTime",
            type: "LONG",
            reverse: true
        }];

        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var result = SearchService.search(searchArgs);
        var totalComment = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();
        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = commentLikeService.getById(objId);
            if (record) {
                resultList.push(record);
            }
        }

    var commentList = [];
    if(resultList){
    for (var h = 0; h < resultList.length; h++) {
        var result1 = resultList[h];
        var commentObj = {};
        if (result1) {
            commentObj.commentId = result1.id;
            commentObj.createTime = DateUtil.getLongDate(result1.createTime) || "";//评论时间
            commentObj.commentator = result1.loginId;
            var user = UserService.getUser(result1.loginId);
            if(user){
            commentObj.nickName = user.nickName || user.loginId;
             commentObj.logo = user.logo || "";
            var logo = user.logo+"";
            if(logo.indexOf("imgundefined") > -1){
                commentObj.logo = "";
            }
            }else{
                commentObj.nickName = "";
                commentObj.logo = "";
            }
            commentObj.commentData = result1.commentData;
            commentObj.commentImage = result1.commentImage;
            commentObj.replyComment = result1.replyComment || "";
            commentObj.replyTime = "";
            if(result1.replyTime){
                commentObj.replyTime = DateUtil.getLongDate(result1.replyTime) || "";
            }
            commentObj.likes = result1.likes;
            commentObj.isLike = "0";//没点赞
            if(result1.likeLogin){
            for(var y = 0; y < result1.likeLogin.length; y++){
                if(result1.likeLogin[y].loginId == loginId){
                    commentObj.isLike = "1";//点赞了
                    break;
                }
            }
            }
            commentList.push(commentObj);
        }
    }
    }
    var pageData = {
        commentList: commentList,
        totalComment:totalComment,//评论总数
        start:currentPage,
        limit:limit
    };
    if(pageData){
       ret.data = pageData;
    }else{
        ret = ErrorCode.article.E1B04006;//操作失败
    }
    out.print(JSON.stringify(ret));
})();

