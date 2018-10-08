//#import Util.js
//#import DateUtil.js
//#import Info.js
//#import user.js
//#import search.js
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/commentQuery.jsx
//#import $articleCommentLike:services/likeQuery.jsx
(function () {
    var articleId = $.params["articleId"] || "";
    var loginId = $.params["loginId"] || "";
    var currentPage = $.params["start"];
    var limit = $.params["limit"] || 5;
    var prefix = "acl_management2";
    var resultList = [];
    var infoObj = InfoService.getInfo(articleId);
    try {
        var articleInfo = {
            articleId: articleId,
            htmlTitle: infoObj.htmltitle || "",//文章主题
            schedule: infoObj.schedule || "",//文章档期
            content: infoObj.content || "",//文章内容
            author: infoObj.author || "",//作者名称
            authorImageFile: infoObj.authorImageFileId || "",//作者头像
            introduction: infoObj.introduction || "", //作者简介
            tag: infoObj.tag || ""//标签
        };
    }catch(e){
        $.log(e);
    }

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
            commentObj.commentData = result1.commentData;
            commentObj.commentImage = result1.commentImage;
            commentObj.replyComment = result1.replyComment;
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

    var isLikeId = prefix + "_like"+articleId;
    var likeLogin = commentLikeService.getById(isLikeId);
    var isLike = "0";//没点赞
    if(likeLogin&&likeLogin.logins){
    for (var r = 0; r < likeLogin.logins.length; r++){
        if(likeLogin.logins[r].loginId == loginId){
            isLike = "1";//点过赞
            break;
        }
    }
    }
    var collectionId = prefix + "_collection_" + articleId;
    var collection = commentLikeService.getById(collectionId);
    var isCollection = "0";
    if(collection&&collection.logins){
        for (var r = 0; r < collection.logins.length; r++){
            if(collection.logins[r].loginId == loginId){
                isCollection = "1";//收藏过
                break;
            }
        }
    }
    var totalLike= 0;
    if(likeLogin&&likeLogin.likes){
        totalLike = likeLogin.likes;
    }
    var totalCollection = 0;
    if(collection&&collection.collections){
        totalCollection = collection.collections;
    }
    var pageData = {
        commentList: commentList,
        articleInfo:articleInfo,
        totalComment:totalComment,//评论总数
        totalLike:totalLike,//点赞数
        totalCollection:totalCollection,//收藏人数
        isArticleLike:isLike,
        isCollection:isCollection
    };
    var data = {};
    if(pageData){
        data = {
            code: "S0A00000",
            msg: "success",
            data:pageData
        }
    }else{
        data = {
            code: "E1B04006",
            msg: "操作失败"
        }
    }
    out.print(JSON.stringify(data));
})();

