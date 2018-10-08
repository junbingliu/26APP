//#import doT.min.js
//#import Util.js
//#import column.js
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

(function () {
    var merchantId = $.params["m"];

    var jArgs = PreDepositRuleSettingService.getArgs();
    if (!jArgs) {
        jArgs = {};
    }

    var recordList = [];
    var columnIds = jArgs.columnIds;
    if (columnIds && columnIds != "") {
        var cIds = columnIds.split(",");
        for (var i = 0; i < cIds.length; i++) {
            var cid = cIds[i];

            var columnPath = ColumnService.getColumnNamePathWithoutFirst(cid, "c_10000", "/");

            var jRecord = {};
            jRecord.id= cid;
            jRecord.columnPath= columnPath;

            recordList.push(jRecord);
        }
    }

    var pageData = {
        merchantId: merchantId,
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/load_columnIds.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

