//#import doT.min.js
//#import Util.js
//#import excel.js
//#import file.js
(function () {
    var merchantId = $.params["m"];
    var export_file_type = "outPutProductModal";
    var histories = Excel.getExcelList4History(merchantId, export_file_type, "1");
    var pageData = {
        merchantId:merchantId,
        histories:histories
    };
    var template = $.getProgram(appMd5, "pages/productAttribute.html");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();