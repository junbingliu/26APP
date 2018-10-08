//#import Util.js
//#import Info.js
(function(){
    var articleId = $.params["articleId"];
    var obj = InfoService.getInfo(articleId);
    var articleObj = {};
    articleObj.articleId = obj.objId;
    articleObj.shareTitle = obj.shareTitle;
    articleObj.appShareImageFile = obj.appShareImageFileId;
    articleObj.shareDescription  = obj.shareDescription;
    var data = {};
    if(obj){
        data = {
            code: "S0A00000",
            msg: "success",
            data:articleObj
        }
    }else{
        data = {
            code: "E1B04006",
            msg: "操作失败"
        }
    }
    out.print(JSON.stringify(data));
})();