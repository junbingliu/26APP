//#import pigeon.js
//#import $articleCommentLike:services/commentLikeService.jsx
//#import Util.js
//#import search.js

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var cls = commentLikeService.getById(id);
        if (cls) {
            var doc = {};
            doc.id = cls.id;
            doc.type = cls.type;
            doc.formName = cls.formName;//表名
            doc.loginId = cls.loginId;//点赞人ID
            doc.articleTitle = cls.articleTitle;//文章名称
            doc.articleId = cls.articleId;//文章ID
            doc.likes = cls.likes;
            doc.ot = "likeList2";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);

})();