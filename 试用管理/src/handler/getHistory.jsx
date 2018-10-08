//#import excel.js
//#import Util.js
//#import login.js
/**
 * 这是一个获取导出历史的通用方法，通过传过来的listName区分
 */
(function () {
    var merchantId = $.params["m"] || $.getDefaultMerchantId();
    var listName = $.params["listName"] || "";
    var histories = Excel.getExcelList4History(merchantId, listName, "10");
    for(var b = 0; b < histories.length;b++){
        histories[b].url = histories[b].url+"&fileName="+histories[b].fileName;
    }
    out.print(JSON.stringify({
        state: 'ok',
        histories: histories
    }))
})();