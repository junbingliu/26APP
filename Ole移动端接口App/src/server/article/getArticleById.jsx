//#import Util.js
//#import @server/util/ErrorCode.jsx
//#import Info.js
//#import file.js

(function(){
    var ret =  ErrorCode.S0A00000;
    var id = $.params['id'];

    if(!id){
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var jInfo = InfoService.getInfo(id);
    if(!jInfo){
        ret = ErrorCode.article.E1B04013;
        out.print(JSON.stringify(ret));
        return;
    }
    ret.data = {
        id:jInfo.id,
        title:jInfo.title,
        content:jInfo.content,
        shareTitle:jInfo.shareTitle,
        shareDescription:jInfo.shareDescription,
        shareImage:FileService.getRelatedUrl(jInfo.appShareImageFileId),
        author:jInfo.author,
        authorImage:FileService.getRelatedUrl(jInfo.authorImageFileId),
    };
    out.print(JSON.stringify(ret));
})();