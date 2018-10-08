//#import Util.js
//#import user.js
//#import login.js
//#import search.js
//#import Info.js
//#import @server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/likeQuery.jsx
//#import $articleCommentLike:services/commentQuery.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var loginId = $.params["loginId"];
    if (!loginId) {
        loginId = LoginService.getFrontendUserId();
    }
    if (!loginId) {
        ret = ErrorCode.article.E1B04009;//当前用户没登录
        out.print(JSON.stringify(ret));
        return
    }
    var prefix = "acl_management2";
    var commentImage = $.params["commentImage"] || "";
    commentImage = commentImage.split(",");
    var data = $.params["commentData"] || "";
    var articleId = $.params["articleId"] || "";
    var isComment = $.params["isComment"] || "";
    var commentId = $.params["commentId"] || "";
    var articleType = $.params["articleType"] || "文章";
    var articleFileName = $.params["articleFileName"] || "我的收藏";
    var commentData = {
        articleId: articleId,
        loginId: loginId
    };
    if (!isComment) {
        ret = ErrorCode.article.E1B04002;//操作类型为空
        out.print(JSON.stringify(ret));
        return
    }

    var strategy = {
        "0": function () {
            if (!data) {
                ret = ErrorCode.article.E1B04003;//评价内容为空
                return
            }
            commentData = {
                articleId: articleId,
                commentData: data,
                commentType: 1,
                commentImage: commentImage,
                loginId: loginId,
                replyComment: "",
                likes: 0,
                likeLogin: []
            };
            var gg = commentLikeService.addComment(commentData);
            return gg
        },
        "1": function () {
            var islikeId = prefix + "_like" + articleId;
            var islike = commentLikeService.getById(islikeId);
            if (islike && islike.logins != []) {
                for (var b = 0; b < islike.logins.length; b++) {
                    if (islike.logins[b].loginId == loginId) {
                        ret = ErrorCode.article.E1B04004;//当前用户点过赞过
                        return
                    }
                }
            }
            return commentLikeService.addLike(commentData);
        },
        "2": function () {
            var islikeId = prefix + "_like" + articleId;
            var islike = commentLikeService.getById(islikeId);
            var u = "1";
            if (islike && islike.logins != []) {
                for (var b = 0; b < islike.logins.length; b++) {
                    if (islike.logins[b].loginId == loginId) {
                        u = "0";
                        break;
                    }
                }
            }
            if (u == "1") {
                ret = ErrorCode.article.E1B04005;//当前用户没点过赞过
                return
            }
            return commentLikeService.deleteLike(commentData);
        },
        "3": function () {
            commentData = {
                articleId: articleId,
                loginId: loginId,
                articleFileName: articleFileName,
                articleType:articleType
            };
            var isCollectionId = prefix + "_collection_" + loginId;
            var isCollection = commentLikeService.getById(isCollectionId);
            if (isCollection && isCollection.articleBasisList != []) {
                var abl = isCollection.articleBasisList;
                for (var m = 0; m < abl.length; m++) {
                  if(abl[m] == articleId){
                      ret = ErrorCode.article.E1B04008;//当前用户已经收藏过
                      return false;
                  }
                }
                commentLikeService.addCollection(commentData);
            }
            return true;
        },
        "4": function () {
            commentData = {
                articleId: articleId,
                loginId: loginId
            };
            commentLikeService.deleteCollection(commentData);
            return true;
        },
        "5": function () {
            var comment = commentLikeService.getById(commentId);
            if (!comment) {
                ret = ErrorCode.article.E1B04011;//没有此评论
                return
            }
            if (!comment.likeLogin) {
                comment.likes = 0;
                comment.likeLogin = [];
            }
            comment.likes = comment.likes + 1;
            var now = new Date();
            if (comment.likeLogin) {
                for (var h = 0; h < comment.likeLogin.length; h++) {
                    if (comment.likeLogin[h].loginId == loginId) {
                        ret = ErrorCode.article.E1B04010;//当前用户已经点赞过此评论
                        return
                    }
                }
            }
            var likeLoginObj = {};
            likeLoginObj.loginId = loginId;
            likeLoginObj.createTime = now.getTime();
            comment.likeLogin.push(likeLoginObj);
            return commentLikeService.update(comment.id, comment);
        },
        "6": function () {
            var comment = commentLikeService.getById(commentId);
            if (!comment) {
                ret = ErrorCode.article.E1B04011;//没有此评论
                return
            }
            var isCom = "0";
            if (comment.likeLogin && comment.likeLogin != []) {
                for (var h = 0; h < comment.likeLogin.length; h++) {
                    if (comment.likeLogin[h].loginId == loginId) {
                        isCom = "1";
                        break;
                    }
                }
                if (isCom == "1") {
                    comment.likeLogin = commentLikeService.deleteArrayOne(comment.likeLogin, loginId, "1");
                    comment.likes = comment.likes - 1;
                } else {
                    ret = ErrorCode.article.E1B04012;
                    out.print(JSON.stringify(ret));
                    return
                }
                if (comment.likes < 0) {
                    comment.likes = 0;
                }
                return commentLikeService.update(comment.id, comment);
            }
        },
        "7": function () {
            commentData = {
                loginId: loginId,
                articleFileName: articleFileName
            };
            return commentLikeService.deleteFile(commentData);
        }
    };
    var calculate = function (level) {
        return strategy[level]();
    };
    var ok = false;
    try {
        ok = calculate(isComment);
        ok = ok+"";
    } catch (e) {
        $.log(e);
        ret = ErrorCode.article.E1B04006;//操作失败
        out.print(JSON.stringify(ret));
        return
    }
    if (ok != "false") {
        // if (ok == "haveOne") {
        //     ret = ErrorCode.article.E1B04007;//该用户已经评论过了
        //     out.print(JSON.stringify(ret));
        //     return
        // }
        if(articleId){
        var articleLikeId = prefix + "_like" + articleId;
        var like = commentLikeService.getById(articleLikeId);
        var collectionId = prefix + "_collection_" + articleId;
        var collection = commentLikeService.getById(collectionId);
        var likes = 0;
        var collections = 0;
        if(collection && collection.collections > 0){
            collections = collection.collections;
        }
        if(like &&like.likes > 0){
            likes = like.likes;
        }
        var dd = {
            likes: likes,
            collections:collections
        };
            if(commentId){
                dd = {};
                var comment = commentLikeService.getById(commentId);
                dd.likes = comment.likes;
            }
        ret.data = dd;
        }
        out.print(JSON.stringify(ret));
        return
    }
    out.print(JSON.stringify(ret));
})();