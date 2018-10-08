//#import Util.js
//#import doT.min.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx

(function () {

    var merchantId = $.params["m"];
    var id = $.params["id"];
    var pageData = {
        merchantId: merchantId,
        id : id,
    };
    var result = LotteryEventManageService.getAllList(0, -1);
    var list = [];
    for (var i = 0; i < result.length; i++) {
        if(result[i]){
            list.push({id: result[i].id, name: result[i].eventName});
        }
    }
    pageData.list = list;
    var template = $.getProgram(appMd5, "pages/RecordList_verificationCode.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

