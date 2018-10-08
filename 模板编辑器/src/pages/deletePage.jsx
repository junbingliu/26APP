//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
(function(){
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if(!m){
        m="m_100";
    };
    var pageId = $.params.pageId;
    AppEditorService.deletePage(m,rappId,pageId);
    response.sendRedirect("listPages.jsx?m=" + m +"&rappId=" + rappId);
})();