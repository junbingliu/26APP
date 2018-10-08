//#import doT.min.js
//#import excel.js
//#import Util.js
//#import file.js

(function () {
    var m = $.params["m"];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var export_file_type = "outPutProductListByTitle";

    var histories = Excel.getExcelList4History(m, export_file_type, "10");

    var template = $.getProgram(appMd5, "pages/outPutProductMessageLog.html");
    var pageData = {histories: histories};


    var pageFn = doT.template(template);
    out.print(pageFn(pageData));

})();