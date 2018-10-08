//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/countryManagementService.jsx
(function () {

    var countryList =CountryManagementService.getAllCountryList(0,-1);
    var str ="";
    for(var i in countryList){
        str += countryList[i].key +",";
    }
    if(str.length>1){
        out.print(str.substr(0,str.length-1));
    }
})();

