//#import Util.js
//#import login.js
//#import @server/util/H5CommonUtil.jsx
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    var loginId = $.params["loginId"];
    if (!loginId) {
        loginId = LoginService.getFrontendUserId();
    }
    if (!loginId) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04009);
        return
    }
    var commentId = $.params["commentId"] || "";//评论ID
    if (!commentId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    var comment = commentLikeService.getById(commentId);
    if (!comment) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04011);//没有此评论
        return
    }
    var isAddLike = false;
    if (comment && comment.likeLogin && comment.likeLogin.length > 0) {
        for (var b = 0; b < comment.likeLogin.length; b++) {
            if (comment.likeLogin[b].loginId == loginId) {
                isAddLike = true;
            }
        }
    }
    //没有点赞过的就点赞，点赞过的就取消点赞
    if (!isAddLike) {
        if (!comment.likeLogin) {
            comment.likes = 0;
            comment.likeLogin = [];
        }
        comment.likes = comment.likes + 1;
        var now = new Date();
        var likeLoginObj = {};
        likeLoginObj.loginId = loginId;
        likeLoginObj.createTime = now.getTime();
        comment.likeLogin.push(likeLoginObj);
        commentLikeService.update(comment.id, comment);
    } else {
        comment.likeLogin = commentLikeService.deleteArrayOne(comment.likeLogin, loginId, "1");
        comment.likes = comment.likes - 1;
        if (comment.likes < 0) {
            comment.likes = 0;
        }
        commentLikeService.update(comment.id, comment);
    }
    var data = {
        likeCount: comment.likes//最新点赞数量
    };
    H5CommonUtil.setSuccessResult(data);
})();