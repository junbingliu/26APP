//#import Util.js
//#import login.js

;(function(){
    try{
        var user = LoginService.getFrontendUser();
        var userName = "";
        if(user.realName){
            userName = user.realName;
        }
        else if(user.loginId){
            userName = user.loginId;
        }
        else{
            userName = user.id;
        }

        out.print(userName);
    }
    catch(e){
        var ret = {
            state:"err",
            msg:e
        }
        out.print((ret));
    }
})();