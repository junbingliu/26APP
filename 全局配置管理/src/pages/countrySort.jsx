//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var sortType = $.params["sortType"];
    var searchField = $.params["searchField"];
    var countryList = CountryManagementService.getAllCountryList(0,-1);
    countryList.sort(CountryManagementService.getSortFun(sortType, 'key'));
    var pageData = {
        merchantId: merchantId,
        searchField:searchField || "",
        countryList: countryList
    };
    var template = $.getProgram(appMd5, "pages/countryList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

