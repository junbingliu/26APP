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
        var token = GenToken.get("addressToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }

        var addressId = $.params.addressId;
        var address = AddressService.getAddressById(userId,addressId);
        ret.address = address;
        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
    }
})();