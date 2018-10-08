//#import doT.min.js
//#import HttpUtil.js
//#import Util.js
//#import column.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx


(function () {


    var provincecode = $.params["provincecode"];
    var citycode = $.params["citycode"];


    var village=JSON.parse(InfoscapeUtil.get("/oleMobileApi/server/member/getShopInfo.jsx?citycode="+citycode+"&provincecode="+provincecode));
    for (var i=0;i<village.length;i++){
        villageList.push({id:village[i].id,name:village[i].name});
    }
    var villageList=[];
        out.print(JSON.stringify(villageList));

})();

