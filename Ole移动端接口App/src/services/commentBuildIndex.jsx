//#import pigeon.js
//#import Util.js
//#import search.js
//#import $articleCommentLike:services/commentLikeService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var obj = commentLikeService.getById(id);
        if (obj) {
            var doc = {};
            doc.id = obj.id;
            doc.keyword_text = obj.articleTitle + "|" + obj.loginId;
            doc.articleTitle_text = obj.articleTitle;
            doc.loginId_text = obj.loginId;
            doc.articleId = obj.articleId;
            doc.commentType = obj.commentType;
            doc.likes = obj.likes;
            doc.createTime= obj.createTime;
            doc.ot = "commentList";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);
})();