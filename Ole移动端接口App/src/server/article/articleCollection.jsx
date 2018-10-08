//#import Util.js
//#import pigeon.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import user.js
//#import cookie.js
//#import base64.js
//#import NoticeTrigger.js
//#import DESEncryptUtil.js
//#import file.js
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $articleCommentLike:services/likeQuery.jsx
(function () {
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }

    var prefix = "acl_management2";
    var imageBytes = $.params["imageBytes"];
    var action = "";
    var articleId = "";
    var newFileName = "";
    var articleFileName = "";
    var ImageName = "";
    var fileId = "";
    if (imageBytes) {
        var array = [];
        array.push(imageBytes);
        action = $.params["action"];
        articleId = $.params["articleId"];
        newFileName = $.params["newFileName"];
        articleFileName = $.params["articleFileName"];
        ImageName = $.params["imageName"];
        var fileIdObj = FileService.addFileByBytes(imageBytes, ImageName);
        fileId = fileIdObj.fileId;
    }
    if (!imageBytes) {
        var jFileInfos = $.uploadFiles("png,jpg", 1024 * 1024 * 10);
        var jFileInfo = jFileInfos[0];
        var jParameters = jFileInfo["parameters"];
        fileId = jFileInfo.fileId;
        action = jParameters.action;
        articleId = jParameters.articleId || "";
        newFileName = jParameters.newFileName;
        articleFileName = jParameters.articleFileName;
        ImageName = jParameters.imageName;
        var ok = "";
        var loginId = jParameters.loginId;
        var articleType = jParameters.articleType || "";
    }
    if (!loginId) {
        loginId = LoginService.getFrontendUserId();
    }
    if (!action) {
        setResultInfo("E1B0003", "操作类型为空");
        return;
    }
    if (!loginId) {
        $.log(loginId);
        setResultInfo("E1B0004", "没有登录");
        return;
    }
    var ima = {};
    if (fileId) {
        ima.imageName = ImageName || "notName";
        ima.fileId = fileId;
    }
    var commentData = {};
    if (action == "0") {
        commentData = {
            articleId: articleId,
            articleType: articleType,
            loginId: loginId,
            articleFileName: articleFileName,
            articleFileImage: ima
        };
        if (articleId) {
            var isCollectionId = prefix + "_collection_" + loginId;
            var isCollection = commentLikeService.getById(isCollectionId);
            if (isCollection && isCollection.articleBasisList.length != []) {
                var abl = isCollection.articleBasisList;
                for (var m = 0; m < abl.length; m++) {
                    if (abl[m] == articleId) {
                        setResultInfo("E1B04008", "文章已被收藏");
                        return
                    }
                }
            }
        }
        ok = commentLikeService.addCollection(commentData);
        if (ok) {
            setResultInfo("S0A00000", "操作成功");
            return;
        } else {
            setResultInfo("E1B04015", "添加失败");
            return
        }
    }
    if (action == "1") {
        commentData = {
            loginId: loginId,
            articleFileName: articleFileName,
            newFileName: newFileName,
            articleFileImage: ima
        };
        ok = commentLikeService.updateFileM(commentData);
        if (ok) {
            setResultInfo("S0A00000", "操作成功");
            return
        } else {
            setResultInfo("E1B04014", "修改失败，原文件夹不存在");
            return
        }
    }

})();