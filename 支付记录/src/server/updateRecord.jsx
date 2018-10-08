//#import Util.js
//#import realPayRec.js
//#import login.js

(function () {
    var id = $.params.id;
    var payState = $.params.payState;
    var paidMoneyAmount = $.params.paidMoneyAmount;
    var rec = RealPayRecordService.getPayRec(id);
    rec.payState = payState;
    rec.paidMoneyAmount = paidMoneyAmount;
    rec.paidTime = (new Date()).getTime();
    rec.bankSN = $.params.transactionSn;
    var userId = LoginService.getBackEndLoginUserId();

    RealPayRecordService.updateRealPayRecord(id, rec);
    var ret = {
        state: "ok"
    };
    out.print(JSON.stringify(ret));
})();