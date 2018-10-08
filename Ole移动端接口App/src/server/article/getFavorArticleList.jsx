//#import Util.js
//#import login.js
//#import user.js
//#import Info.js
//#import file.js
//#import cookie.js
//#import DateUtil.js
//#import @server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    // var cookies = request.getCookies();
    // $.log("......................111cookies:"+cookies);
    // if (cookies != null) {
    //     for (var i = 0; i < cookies.length; i++) {
    //         var cookie = cookies[i];
    //         $.log("....................111autoLogin:"+cookie.getName()+"="+cookie.getValue());
    //     }
    // }
    var articleFileName = $.params["articleFileName"];
    var loginId = $.params["loginId"];
    var start = Number($.params["start"]) || 1;
    var limit = Number($.params["limit"]) || 10;

    var ret = ErrorCode.S0A00000;
    if (!loginId) {
        loginId = LoginService.getFrontendUserId();
    }
    if (!loginId) {
        ret = ErrorCode.article.E1B04009;//当前用户没登录
        out.print(JSON.stringify(ret));
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
                    try{
                    if (ima != {} && ima.fileId) {
                        fileData.articleFileImage = FileService.getFullPath(ima.fileId);
                        fileData.imageName = ima.imageName;
                    }
                    }catch (e){
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
                        collectionData.bannerImageFileId = FileService.getFullPath(infoObj.appShareImageFileId) || "";
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