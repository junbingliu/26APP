//#import excel.js
//#import file.js
//#import Util.js
(function () {
    var merchantId = $.params["m"];
    var list = Excel.getExcelList4History(merchantId, "channel_lotteryLogList", 10);
    for(var i = 0; i < list.length; i++){
        list[i].url = list[i].url+"&fileName="+list[i].fileName;
    }
    out.print(JSON.stringify(list));
})();