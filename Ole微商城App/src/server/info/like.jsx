//#import Util.js
//#import login.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
/**
 * 杂志点赞/取消点赞
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
    var prefix = "acl_management2";
    var articleId = $.params["articleId"] || "";//杂志id
    var commentData = {
        articleId: articleId,
        loginId: loginId
    };
    if (!articleId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    var islikeId = prefix + "_like" + articleId;
    var islike = commentLikeService.getById(islikeId);
    var isAddLike = false;
    if (islike && islike.logins != []) {
        for (var b = 0; b < islike.logins.length; b++) {
          if (islike.logins[b].loginId == loginId) {
               isAddLike = true;
           }
        }
    }
    var likeCount = islike.likes;
    //如果已点赞，则取消点赞，否则点赞
    if (isAddLike) {
        likeCount -= 1;
        commentLikeService.deleteLike(commentData);
    } else {
        commentLikeService.addLike(commentData);
        likeCount += 1;
    }
    var data = {
        likeCount:likeCount//最新点赞数量
    };
    H5CommonUtil.setSuccessResult(data);
})();