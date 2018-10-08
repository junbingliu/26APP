//#import doT.min.js
//#import Util.js
//#import column.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx


(function () {

    var merchantId = $.params["m"];

    var pageData = {
        merchantId: merchantId
    };

    var  id = "c_region_1602";
    var result=ColumnService.getChildren(id);
    var provinceList=[];
    for (var i = 0;i<result.length;i++){
        provinceList.push({id:result[i].id,name:result[i].name});
    }
    pageData.provinceList =provinceList;

    /*
    * 抽奖活动类型
    * */
    var activit =  ActivitiesHenService.getAllList(0,-1);
    var activitList=[];
    for (var i = 0;i<activit.length;i++){
        if(activit[i]) {
            activitList.push({id: activit[i].id, name: activit[i].title});
        }
    }
    pageData.activitList =activitList;



    var template = $.getProgram(appMd5, "pages/RecordList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));




})();

