//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
(function(){
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if(!m){
        m="m_100";
    }
    var rapp = AppService.getApp(rappId);
    var meta = AppService.getAppMeta(rappId);
    var templates = meta.templates;

    var template = $.getProgram(appMd5,'pages/addPage1.jsxp');
    var pageData = {templates:templates,rapp:rapp,rappId:rappId,m:m};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();