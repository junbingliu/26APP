//#import Util.js
//#import app.js
//#import doT.min.js
//#import @handlers/util.jsx
//#import login.js
//#import SaasRoleAssign.js
(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
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
    var appLogList=AppService.getAppLog(m,rappId,pageId);
    var template = $.getProgram(appMd5,'pages/listLog.jsxp');
    var pageData = {logs:appLogList,rappId:rappId,m:m,pageId:pageId};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);

})();