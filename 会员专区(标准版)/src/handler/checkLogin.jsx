//#import Util.js
//#import login.js
//#import sysArgument.js

;(function(){
    try{
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

        var ret = {
            state:true,
            alreadyLogin:alreadyLogin,
            loggedUserName:loggedUserName + "",
            sslWebSite:''
        }


            var sslWebSite = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrlHttps");
            ret.sslWebSite = sslWebSite;


        out.print(JSON.stringify(ret));
    }catch(e){
        var ret = {
            state:false,
            alreadyLogin:false,
            sslWebSite:''
        }
        out.print(JSON.stringify(ret));
    }
})();