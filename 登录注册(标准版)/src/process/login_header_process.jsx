//#import Util.js
//#import login.js
//#import sysArgument.js

(function(processor){
    processor.on("all",function(pageData,dataIds,elems){
        var user = LoginService.getFrontendUser();
        var alreadyLogin = false,loggedUserName = "";
        if(user!=null){
            alreadyLogin = true;
            if(user.realName){
                loggedUserName = user.realName;
            }else if(user.loginId){
                loggedUserName = user.loginId;
            }else{
                loggedUserName = user.id;
            }
        }
        setPageDataProperty(pageData,"alreadyLogin",alreadyLogin);
        setPageDataProperty(pageData,"loggedUserName",loggedUserName + "");

        var normalWebSite = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl");
        var sslWebSite = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrlHttps");

        setPageDataProperty(pageData,"normalWebSite",normalWebSite);
        setPageDataProperty(pageData,"sslWebSite",sslWebSite);
    });
})(dataProcessor);