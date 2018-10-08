//#import Util.js
//#import user.js
//#import login.js
//#import search.js
//#import Info.js
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/likeQuery.jsx
(function () {
    var data1 = {};
    var id = "";
    var loginId = $.params["loginId"];
    if (!loginId) {
        data1 = {
            code: "E1B04009",
            msg: "当前用户没登录"
        };
        out.print(JSON.stringify(data1));
        return
    }
    var prefix = "acl_management2";
    var commentImage = $.params["commentImage"] || "";
    commentImage = commentImage.split(",");
    var data = $.params["commentData"] || "";
    var articleId = $.params["articleId"] || "";
    var isComment = $.params["isComment"] || "";
    var commentId = $.params["commentId"] || "";
    var commentData = {
        articleId: articleId,
        loginId: loginId
    };
    if (!articleId) {
        data1 = {
            code: "E1B04001",
            msg: "文章id不能问空"
        };
        out.print(JSON.stringify(data1));
        return
    }
    if (!isComment) {
        data1 = {
            code: "E1B04002",
            msg: "操作类型为空"
        };
        out.print(JSON.stringify(data1));
        return
    }

    var strategy = {
        "0": function () {
            if (!data) {
                data1 = {
                    code: "E1B04003",
                    msg: "评价内容为空"
                };
                out.print(JSON.stringify(data1));
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
            return commentLikeService.addComment(commentData);
        },
        "1": function () {
            var islikeId = prefix + "_like" + articleId;
            var islike = commentLikeService.getById(islikeId);
            if (islike && islike.logins != []) {
                for (var b = 0; b < islike.logins.length; b++) {
                    if (islike.logins[b] == loginId) {
                        data1 = {
                            code: "E1B04004",
                            msg: "当前用户已点赞过"
                        };
                        out.print(JSON.stringify(data1));
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
                data1 = {
                    code: "E1B04005",
                    msg: "当前用户没点过赞过"
                };
                out.print(JSON.stringify(data1));
                return
            }
            return commentLikeService.deleteLike(commentData);
        },
        "3": function () {
            var isCollectionId = prefix + "_collection_" + loginId;
            var isConllection = commentLikeService.getById(isCollectionId);
            if (isConllection) {
                if (isConllection.articleList && isConllection.articleList != []) {
                    for (var g = 0; g < isConllection.articleList.length; g++) {
                        if (isConllection.articleList[g].articleId == articleId) {
                            data1 = {
                                code: "E1B04008",
                                msg: "当前用户已经收藏过"
                            };
                            out.print(JSON.stringify(data1));
                            return
                        }
                    }
                }
            }
            return commentLikeService.addCollection(commentData);
        },
        "4": function () {
            return commentLikeService.deleteCollection(commentData);
        },
        "5": function () {
            var comment = commentLikeService.getById(commentId);
            if (!comment) {
                data1 = {
                    code: "E1B04011",
                    msg: "没有此评论"
                };
                out.print(JSON.stringify(data1));
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
                        data1 = {
                            code: "E1B04010",
                            msg: "当前用户已经点赞过此评论"
                        };
                        out.print(JSON.stringify(data1));
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
                data1 = {
                    code: "E1B04011",
                    msg: "没有此评论"
                };
                out.print(JSON.stringify(data1));
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
                    comment.likeLogin = commentLikeService.deleteArrayOne(comment.likeLogin, loginId);
                    comment.likes = comment.likes - 1;
                } else {
                    data1 = {
                        code: "E1B04012",
                        msg: "没有点赞次评论"
                    };
                    out.print(JSON.stringify(data1));
                    return
                }
                if (comment.likes < 0) {
                    comment.likes = 0;
                }
                return commentLikeService.update(comment.id, comment);
            }
        }
    };
    var calculate = function (level) {
        return strategy[level]();
    };
    var ok = false;
    try{
        ok = calculate(isComment);
    }catch (e){
        $.log(e);
        data1 = {
            code: "E1B04006",
            msg: "操作失败"
        };
        out.print(JSON.stringify(data1));
        return
    }
    if (ok) {
        if (ok == "haveOne") {
            data1 = {
                code: "E1B04007",
                msg: "当前用户已经评论过"
            };
            out.print(JSON.stringify(data1));
            return
        }
        data1 = {
            code: "S0A00000",
            msg: "success"
        };
        out.print(JSON.stringify(data1));
    }
})();