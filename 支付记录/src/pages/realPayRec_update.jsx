//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import realPayRec.js

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var id = $.params['id'];
    var source = $.getProgram(appMd5, "pages/realPayRec_update.jsxp");
    var realPayRec = RealPayRecordService.getPayRec(id);
    if(realPayRec){
        realPayRec.needPayMoneyAmount = (Number(realPayRec.needPayMoneyAmount)/100).toFixed(2);
        realPayRec.paidMoneyAmount = (Number(realPayRec.paidMoneyAmount)/100).toFixed(2);
    }
    var render = template.compile(source);
    var pageData = {m: m, realPayRec: realPayRec};
    out.print(render(pageData));
})();

