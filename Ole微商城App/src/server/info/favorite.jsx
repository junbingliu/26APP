//#import Util.js
//#import login.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $articleCommentLike:services/commentLikeService.jsx

(function () {
    var loginId = LoginService.getFrontendUserId();

    if (!loginId) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04009);
        return
    }
    var prefix = "acl_management2";
    var articleId = $.params["articleId"] || "";
    var articleType = $.params["articleType"] || "文章";
    var articleFileName = $.params["articleFileName"] || "我的收藏";
    if (!articleId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    var commentData = {
        articleId: articleId,
        loginId: loginId,
        articleFileName: articleFileName,
        articleType: articleType
    };
    var isCollected = false;
    var isCollectionId = prefix + "_collection_" + loginId;
    var isCollection = commentLikeService.getById(isCollectionId);
    //判断是否有收藏过，如果已经收藏过的，则删除收藏
    if (isCollection && isCollection.articleBasisList != []) {
        var abl = isCollection.articleBasisList;
        for (var m = 0; m < abl.length; m++) {
            if (abl[m] == articleId) {
                isCollected = true;
                break;
            }
        }
    }
    if (!isCollected) {
        commentLikeService.addCollection(commentData);
    } else {
        commentLikeService.deleteCollection(commentData);
    }

    H5CommonUtil.setSuccessResult();
})();