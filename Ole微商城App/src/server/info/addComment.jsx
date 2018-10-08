//#import Util.js
//#import user.js
//#import login.js
//#import search.js
//#import Info.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/likeQuery.jsx
//#import $articleCommentLike:services/commentQuery.jsx
/**
 * 杂志发表评论
 */
(function () {
    var loginId = $.params["loginId"];
    if (!loginId) {
        loginId = LoginService.getFrontendUserId();
    }
    if (!loginId) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04009);
        return
    }
    var articleId = $.params["articleId"] || "";//杂志id
    var comment = $.params["comment"] || "";//评论内容
    var commentImage = $.params["commentImage"] || "";
    commentImage = commentImage.split(",");
    if (!articleId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    if (!comment) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04003);
        return
    }
    var commentData = {
        articleId: articleId,
        commentData: comment,
        commentType: 1,
        commentImage: commentImage,
        loginId: loginId,
        replyComment: "",
        likes: 0,
        likeLogin: []
    };
    var newId = commentLikeService.addComment(commentData);
    $.log("........newId:" + newId);
    H5CommonUtil.setSuccessResult();
})();