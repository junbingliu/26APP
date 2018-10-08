//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    var key = $.params["key"];
    var val = $.params["val"];

    var jCountry={};
    jCountry.id=id;
    jCountry.key=key;
    jCountry.val=val;
    CountryManagementService.updateCountry(jCountry);
    response.sendRedirect("countryList.jsx?m="+merchantId);
})();

