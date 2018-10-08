//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
(function () {
    var merchantId = $.params["m"];
    var searchField = $.params["searchField"];
    var globalVariableList = GlobalVariableManagementService.getAllGlobalVariableList(0,-1);
    var array=[];
    if(searchField){
        for(var i in globalVariableList){
            if(globalVariableList[i].name == searchField){
                array.push(globalVariableList[i]);
            }
        }
    }else{
        array=globalVariableList;
    }

    var pageData = {
        merchantId: merchantId,
        searchField:searchField || "",
        globalVariableList: array
    };
    var template = $.getProgram(appMd5, "pages/globalVariableList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

