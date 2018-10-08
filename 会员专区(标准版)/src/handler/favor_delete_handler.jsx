//#import Util.js
//#import login.js
//#import address.js
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
        var token = GenToken.get("favorToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }

        var type = $.params.type;
        var ids = $.params.ids;
        var splitIds = ids.split(",");

        for (var i=0;i<splitIds.length;i++) {
            var id = splitIds[i];
            if (id) {
                if (type == "merchant" || type == "product" || type == "diy") {
                    Packages.net.xinshi.isone.modules.IsoneModulesEngine.favoriteService.deleteMemberProductFavorite(userId, id, type);
                }
            }
        }

        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
    }
})();