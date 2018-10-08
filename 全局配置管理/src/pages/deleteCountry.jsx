(function () {
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx

    var merchantId = $.params["m"];
    var id = $.params["id"];
    CountryManagementService.deleteCountry(id);
    response.sendRedirect("countryList.jsx?m="+merchantId);
})();

