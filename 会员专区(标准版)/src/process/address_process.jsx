//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import address.js
//#import column.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var requestURI = request.getRequestURI() + "";


        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            response.sendRedirect("/login.html?rurl="+requestURI);
        }

        var mid = "head_merchant";
        var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");

        var addressList = AddressService.getAllAddresses(userId);
        for(var i=0;i<addressList.length;i++){
            if(addressList[i].regionName){
                continue;
            }
            addressList[i].regionName = ColumnService.getColumnNamePath(addressList[i].regionId,'c_region_1602',"");
        }

        var token = GenToken.get("addressToken");
        setPageDataProperty(pageData, "token", token);

        setPageDataProperty(pageData, "requestURI", requestURI + "");
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);
        setPageDataProperty(pageData, "addressList", addressList);


    });
})(dataProcessor);