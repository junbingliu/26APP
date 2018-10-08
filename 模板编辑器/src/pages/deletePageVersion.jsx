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
    var pageVersionId = $.params.pageVersionId;
    var origPageId = $.params.origPageId;

    AppEditorService.deletePageVersion(m,rappId,origPageId,pageVersionId);
    response.sendRedirect("listPageVersions.jsx?m=" + m +"&rappId=" + rappId + "&origPageId=" + origPageId);
})();