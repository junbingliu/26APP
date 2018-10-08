//#import Util.js
//#import login.js
//#import user.js
//#import address.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.org.apache.commons.lang,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.delivery,
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


        var name = request.getParameter("userName");
        var phone = request.getParameter("phone");
        var streetAddress = request.getParameter("address");
        var Zip = request.getParameter("Zip");
        var mobile = request.getParameter("mobile");
        var regionId = request.getParameter("RegionId");
        var key = request.getParameter("addressId");

        var jAddress = new selfApi.JSONObject();
        jAddress.put("regionId", regionId);
        if (selfApi.StringUtils.isNotBlank(Zip)) {
            jAddress.put("postalCode", Zip);
        }
        jAddress.put("address", streetAddress);
        jAddress.put("userName", name);
        jAddress.put("mobile", mobile);
        jAddress.put("phone", phone);
        if (selfApi.StringUtils.isNotBlank(key)) {
            jAddress.put("id", key);
        }
        jAddress.put("isDefault", "false");

        var addressId = selfApi.IsoneModulesEngine.deliveryAddressService.saveAddress(userId, jAddress);

        if (key == "") {
            out.print(addressId);
            return;
        }

    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(ret.errorCode);
    }
})();