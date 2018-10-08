//#import doT.min.js
//#import Util.js
//#import column.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx


(function () {


    var parenId = $.params["parenId"];
        var city=ColumnService.getChildren(parenId);
        var cityList=[];
        for (var i = 0;i<city.length;i++){
            cityList.push({id:city[i].id,name:city[i].name});
        }
        cityList =cityList;



        out.print(JSON.stringify(cityList));

})();

