//#import Util.js
//#import pageService.js
//#import app.js
//#import appEditor.js

;
(function () {
    var m = $.params.m;
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
    var page = AppEditorService.getPageById(m,rappId,pageId);
    if(page){
        var ret = {state:"ok",page:page};
        out.print(JSON.stringify(ret));

    }
    else{
        var ret = {state:"not found"};
        out.print(JSON.stringify(ret));
    }
})();
