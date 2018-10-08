//#import Util.js
//#import doT.min.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {





    var merchantId = $.params["m"];
    var pageData = {
        merchantId: merchantId,
    };
    var result =ActivitiesHenService.getAllList(0,-1);
    var list = [];
    for(var i = 0;i<result.length;i++){
        list.push({id:result[i].id, name:result[i].title});
    }
    pageData.list = list;

    var template = $.getProgram(appMd5, "pages/RecordList_som.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

