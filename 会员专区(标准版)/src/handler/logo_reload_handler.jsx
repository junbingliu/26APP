//#import Util.js
//#import login.js
//#import user.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.org.apache.commons.lang,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.security
    );

    var ret = {
        state:false,
        errorCode:""
    }
    try{
        var contextPath = request.getContextPath();
        var userId = "";

        var loginKey = $.params.u;
        var user = UserService.getUserByKey(loginKey);
        if(user != null){
            userId = user.id
        }else{
            return;
        }
        //var userId = request.getParameter("u");
        //var user = selfApi.IsoneModulesEngine.adminService.getUser(userId);
        var picPath = user.logo;
        out.print(picPath);
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print("");
    }
})();