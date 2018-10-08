//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
(function () {
    var merchantId = $.params["m"];
    var name = $.params["key"];
    var val = $.params["val"];

    var jCountry={};
    jCountry.key=name;
    jCountry.val=val;
    CountryManagementService.addCountry(jCountry);
    response.sendRedirect("countryList.jsx?m="+merchantId);
})();

