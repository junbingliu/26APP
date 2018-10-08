//#import excel.js
//#import Util.js
//#import file.js
//#import @oleMobileApi:server/util/ResponseUtils.jsx
;
(function () {
    var m = $.getDefaultMerchantId();
    var export_file_type = "BlackList";
    var histories = Excel.getExcelList4History(m, export_file_type, "20");
    var list = [];
    for(var i = 0;i<histories.length;i++){
        var hisObj = histories[i];
        if(hisObj.fileName == "undefined"){
            hisObj.fileName = hisObj.createTime;
        }
        hisObj.downloadUrl = hisObj.url + "&fileName=" + hisObj.fileName;
        list.push(hisObj);
    }
    ResponseUtil.success(list);


})();