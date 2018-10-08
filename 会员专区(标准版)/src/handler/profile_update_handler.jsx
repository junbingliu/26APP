//#import Util.js
//#import login.js
//#import @jsLib/GenToken.jsx

;(function(){
    var ret = {
        state:false,
        errorCode:""
    }
    try{
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }

        var paramToken = $.params.token;
        if(!paramToken){
            ret.errorCode = "token_empty";
            out.print(JSON.stringify(ret));
            return;
        }
        var token = GenToken.get("profileToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }

        var loginId = $.params.loginId;
        var updateUser = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginId);
        if(updateUser.optString("id") + "" != userId){
            ret.errorCode = "unlawful_user";
            out.print(JSON.stringify(ret));
            return;
        }

        var realName = $.params.realName;
        var gender = $.params.gender;
        var bth_year = $.params.bth_year;
        var bth_month = $.params.bth_month;
        var bth_day = $.params.bth_day;

        var birthdayTime = 0;
        if(bth_year && bth_month && bth_day){
            birthdayTime = new Date(bth_year,bth_month-1,bth_day).getTime();
        }

        updateUser.put("realName",realName);
        updateUser.put("gender",gender + "");
        updateUser.put("birthday",birthdayTime + "");
        LoginApi.IsoneModulesEngine.memberService.updateUser(updateUser, userId);
        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
    }
})();