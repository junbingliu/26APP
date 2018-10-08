//#import Util.js
//#import login.js
//#import address.js
//#import column.js
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

        var userName = $.params.userName;
        var regionId = $.params.RegionId;
        var address = $.params.address;
        var mobile = $.params.mobile;
        var areaCode = $.params.areaCode;
        var phone = $.params.phone;
        var isDefault = $.params.isDefault;
        var addressId = $.params.id;

        if(!(userName && regionId && address && mobile)){
            ret.errorCode = "input_required";
            out.print(JSON.stringify(ret));
            return;
        }

        var regionName = ColumnService.getColumnNamePath(regionId,'c_region_1602',"");

        var address = {
            userName:userName,
            regionId:regionId,
            regionName:regionName,
            mobile:mobile,
            address:address,
            phone:(areaCode ? areaCode + "-" + phone : phone),
            isDefault:isDefault
        }

        if(addressId){
            address.id = addressId;
        }
        addressId = AddressService.saveAddress(userId,address);
        if(isDefault == "true" || isDefault == "1" || isDefault == true){
            AddressService.setDefaultAddress(userId,addressId);
        }

        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
        $.log(e);
    }
})();