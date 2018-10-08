//#import Util.js
//#import realPayRec.js

var m = $.params.m;
var payInterfaceId = $.params.payInterfaceId;
var start = Number($.params.start);
var limit = Number($.params.limit);
var paidOnly = $.params.paidOnly
var dateString = $.params.dateString;
var list = [];
var total = 0;

if(!payInterfaceId){
    list = RealPayRecordService.getRecords(m,start,limit);
    total = RealPayRecordService.getNumber(m);
}
else {
    if(paidOnly && (paidOnly=='true' || paidOnly=="TRUE") && (dateString)){
        list = RealPayRecordService.getPaidRecs(payInterfaceId,dateString,start,limit);
        total = RealPayRecordService.getPaidRecsCount(payInterfaceId,dateString);
    }
    else{
        list = RealPayRecordService.getRecordsByPayInterface("_all",payInterfaceId,start,limit);
        total = RealPayRecordService.getNumberByPayInterface("_all",payInterfaceId);
    }

}
var ret = {
    state:"ok",
    list:list,
    total:total
}
out.print(JSON.stringify(ret));