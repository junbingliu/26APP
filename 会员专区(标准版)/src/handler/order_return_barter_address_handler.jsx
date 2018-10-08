//#import Util.js
//#import login.js
//#import user.js
//#import address.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.merchant,
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

        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }

        var addressId = $.params.addressId || "";
        var addressList = AddressService.getAllAddresses(userId);
        //$.log(addressList.toSource())
        if(addressList && addressList.length > 0){
            for(var i=0;i<addressList.length;i++){
                addressList[i].addressContent = selfApi.MerchantUtil.getMerchantRegion(addressList[i].regionId) + addressList[i].address;
            }
        }
        var order = {
            orderType: $.params.orderType,
            merchantId:$.params.merchantId
        };
        
        var html = '<select name="userAddress" id="userAddress" onchange="return changeMessage()" onfocus="return changeMessage()" class="select">';
        html += '<option value="" name=",,,,,," ' + (!addressId ? 'selected' : '') + '>请选择...</option>';
        if(addressList && addressList.length > 0){
            for(var i=0;i<addressList.length;i++){
                var addressObj = addressList[i];
                var addressContent = selfApi.MerchantUtil.getMerchantRegion(addressObj.regionId) + addressObj.address;
                var nameStr = addressObj.userName + "," + addressObj.mobile + "," + addressObj.phone + "," + addressObj.postalCode + "," + addressObj.regionId + "," + order.orderType + "," + order.merchantId;
                html += '<option value="' + addressObj.id +'" name="' + nameStr +'" ' + (addressId == addressObj.id ? 'selected' : '') + '>' + addressContent + '</option>';
            }
        }
        
        
        html += '</select>';

        out.print(html);
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print("");
        $.log(e)
    }
})();