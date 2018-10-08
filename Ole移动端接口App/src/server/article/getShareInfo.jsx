//#import Util.js
//#import Info.js
//#import file.js
//#import @server/util/ErrorCode.jsx
(function(){
    var articleId = $.params["articleId"];
    var obj = InfoService.getInfo(articleId);
    var ret =  ErrorCode.S0A00000;
    var articleObj = {};
    articleObj.articleId = obj.objId;
    articleObj.shareTitle = obj.shareTitle;
    articleObj.appShareImageFile = FileService.getFullPath(obj.appShareImageFileId);
    articleObj.shareDescription  = obj.shareDescription;
    if(obj){
        ret.data = articleObj;
    }else{
        ret = ErrorCode.E1B04006;
    }
    out.print(JSON.stringify(ret));
})();