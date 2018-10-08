//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    var jCountry=CountryManagementService.getCountry(id);
    var pageData = {
        merchantId: merchantId,
        jCountry: jCountry
    };

    var template = $.getProgram(appMd5, "pages/countryUpdate.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

