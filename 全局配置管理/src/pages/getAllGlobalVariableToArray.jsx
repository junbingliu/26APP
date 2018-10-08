//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
(function () {

    var globalVariableList = GlobalVariableManagementService.getAllGlobalVariableList(0,-1);
    var str ="";
    for(var i in globalVariableList){
        str += globalVariableList[i].name +",";
    }
    if(str.length>1){
        out.print(str.substr(0,str.length-1));
    }
})();

