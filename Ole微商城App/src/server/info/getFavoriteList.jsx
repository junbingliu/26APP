//#import Util.js
//#import login.js
//#import file.js
//#import Info.js
//#import @server/util/H5CommonUtil.jsx
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx

(function () {
    var articleFileName = $.params["articleFileName"] || "我的收藏";
    var start = Number($.params["start"]) || 1;
    var limit = Number($.params["limit"]) || 10;

    var ret = ErrorCode.S0A00000;
    var loginId = LoginService.getFrontendUserId();
    if (!loginId) {
        H5CommonUtil.setErrorResult(ErrorCode.article.E1B04009);
        return
    }
    var prefix = "acl_management2";
    var collectionTypeId = prefix + "_collection_" + loginId;
    var obj = commentLikeService.getById(collectionTypeId);
    var collectionIds = [];
    var collectionList = [];
    var fileList = [];
    try {
        if (obj && obj.list != []) {
            for (var f = 0; f < obj.list.length; f++) {
                var fileData = {};
                if (obj.list[f]) {
                    if (obj.list[f].articleFileName == articleFileName) {
                        collectionIds = obj.list[f].articleList;
                        break;
                    }
                    var ima = {};
                    fileData.articleFileName = obj.list[f].articleFileName;
                    ima = obj.list[f].articleFileImage;
                    fileData.articleFileImage = "";
                    fileData.imageName = "";
                    try {
                        if (ima != {} && ima.fileId) {
                            fileData.articleFileImage = FileService.getFullPath(ima.fileId);
                            fileData.imageName = ima.imageName;
                        }
                    } catch (e) {
                        $.log(e);
                    }
                    fileList.push(fileData);
                }
            }
        }
        var da = {};
        da.start = start;
        var total = 0;
        var begin = limit * (start - 1);
        if (articleFileName) {
            for (var g = begin; g < start * limit; g++) {
                if (collectionIds[g]) {
                    var articleId = collectionIds[g].articleId;
                    var infoObj = InfoService.getInfo(articleId);
                    var collectionData = {};
                    if (infoObj) {
                        collectionData.articleId = articleId;
                        collectionData.title = infoObj.title;
                        collectionData.bannerImageFileId = FileService.getFullPath(infoObj.bannerImageFileId) || "";
                        collectionData.preface = infoObj.preface || "";
                        collectionData.articleType = collectionIds[g].articleType;
                        collectionList.push(collectionData);
                    }
                }
            }
            total = collectionList.length;
            da.total = total;
            da.limit = collectionList.length;
            da.collectionList = collectionList;
            ret.data = da;
        } else {
            da.total = fileList.length;
            var b = [];
            for (var h = begin; h < start * limit; h++) {
                if (fileList[h]) {
                    b.push(fileList[h]);
                }
            }
            da.limit = b.length;
            da.fileList = b;
            ret.data = da;
        }
    } catch (e) {
        $.log(e);
        ret = ErrorCode.article.E1B04006;
    }
    out.print(JSON.stringify(ret));
})();