//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import @handlers/util.jsx
//#import login.js
//#import SaasRoleAssign.js
(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var rappId = $.params.rappId;
    var loginUserId = LoginService.getBackEndLoginUserId();
    try {
        if (!loginUserId) {
            throw "还没有登录。";
        }
        if(!SaasRoleAssignService.checkAnyPrivileges(loginUserId,m,rappId,["all","readOnly"])){
            throw "没有权限。"
        }
    }
    catch(errmsg){
        var template = $.getProgram(appMd5,'pages/error.jsxp');
        var pageData = {errorMsg:errmsg,rapp:rapp,rappId:rappId,m:m};
        var fn = doT.template(template);
        var html = fn(pageData);
        out.print(html);
        return;
    }

    var rapp = AppService.getApp(rappId);
    var meta = AppService.getAppMeta(rappId);
    var pages = AppEditorService.getPages(m,rappId);
    if(!pages || pages.length==0){
        copyPagesFromTemplate(m,rappId);
    }
    pages = AppEditorService.getPages(m,rappId);
    var template = $.getProgram(appMd5,'pages/listPages.jsxp');
    var pageData = {pages:pages,rapp:rapp,rappId:rappId,m:m};
    if(meta.renderEngine){
        pageData.renderEngine=meta.renderEngine;
    }
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();