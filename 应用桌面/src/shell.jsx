//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import login.js
//#import user.js

(function(){
    var uid = LoginService.getBackEndLoginUserId();
    if(!uid){
        out.print("你还没有登录。");
        return;
    }
    var user = UserService.getUser(uid);
    var m = $.params.m;
    var template = $.getProgram(appMd5, "client/modules/desktop/desktop.html");
    var pageFn = doT.template(template);
    var pageData = {m:m};
    pageData.user = user;

    out.print(pageFn(pageData));
})();
