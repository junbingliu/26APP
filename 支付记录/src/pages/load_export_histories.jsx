//#import doT.min.js
//#import pigeon.js
//#import excel.js
//#import Util.js

(function () {
    var export_file_type = $.params["t"];
    var m = $.params["m"] || "head_merchant";

    var histories = Excel.getExcelList4History(m, export_file_type, "10");

    var template = $.getProgram(appMd5, "pages/load_export_histories.jsxp");
    var pageData = {histories: histories};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();