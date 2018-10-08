//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
(function () {

    var merchantId = $.params["m"];
    var searchField = $.params["searchField"];
    var countryList = CountryManagementService.getAllCountryList(0,-1);
    var array=[];
    for(var i in countryList){
        if(countryList[i]){
            array.push(countryList[i]);
        }
    }
    var pageData = {
        merchantId: merchantId,
        searchField:searchField || "",
        countryList: array
    };
    var template = $.getProgram(appMd5, "pages/countryList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

