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
    try{
        AppEditorService.removeFromEffectiveTemplate(m,rappId);
        var template = $.getProgram(appMd5,'pages/setEffective.jsxp');
        var pageData = {msg:"成功取消有效模版。",state:true,m:m };
        var fn = doT.template(template);
        var html = fn(pageData);
        out.print(html);
    }
    catch(e){
        var template = $.getProgram(appMd5,'pages/setEffective.jsxp');
        var pageData = {msg:"取消有效模版失败。",state:false,m:m };
        var fn = doT.template(template);
        var html = fn(pageData);
        out.print(html);
    };


})();