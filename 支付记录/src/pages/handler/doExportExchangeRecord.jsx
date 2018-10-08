//#import pigeon.js
//#import Util.js
//#import DateUtil.js
//#import excel.js
//#import search.js
//#import realPayRec.js
//#import PaymentUtil.js
//#import payment.js

(function () {
    var fileName = $.params["export_fileName"];

    var payInterfaceId = $.params["payInterfaceId"];
    var payState = $.params["payState"];
    var merchantId = $.params["m"] || "head_merchant";
    var keyword = $.params["keyword"];
    var accountBeginDate = $.params["accountBeginDate"];
    var accountEndDate = $.params["accountEndDate"];
    var isSearch = false;

    var titles = [
        {"index": "0", "columnWidth": "22", "field": "outerId", "title": "支付单号"},
        {"index": "1", "columnWidth": "25", "field": "orderAliasCodes", "title": "对应订单号"},
        {"index": "2", "columnWidth": "25", "field": "paymentName", "title": "支付方式"},
        {"index": "3", "columnWidth": "10", "field": "payInterfaceId", "title": "支付方式Id"},
        {"index": "4", "columnWidth": "10", "field": "needPayMoneyAmount", "title": "支付金额"},
        {"index": "5", "columnWidth": "10", "field": "paidMoneyAmount", "title": "已付金额"},
        {"index": "6", "columnWidth": "20", "field": "createTimeString", "title": "生成时间"},
        {"index": "7", "columnWidth": "20", "field": "paidTimeString", "title": "支付时间"},
        {"index": "8", "columnWidth": "10", "field": "payStateString", "title": "支付状态"},
        {"index": "9", "columnWidth": "30", "field": "bankSN", "title": "交易流水"}
    ];

    var searchParams = {};
    //支付方式
    if (payInterfaceId && payInterfaceId != "-1") {
        searchParams.payInterfaceId = payInterfaceId;
        isSearch = true;
    }
    //支付方式
    if (payState && payState != "-1") {
        searchParams.payState = payState;
        isSearch = true;
    }
    //支付方式
    if (keyword && keyword != "-1") {
        searchParams.keyword = keyword;
        isSearch = true;
    }
    //开始时间
    if (accountBeginDate && accountBeginDate != "") {
        searchParams.beginPayTime = DateUtil.getLongTime(accountBeginDate + ' 00:00:00');
        isSearch = true;
    }
    //结束时间
    if (accountEndDate && accountEndDate != "") {
        searchParams.endPayTime = DateUtil.getLongTime(accountEndDate + ' 23:59:59');
        isSearch = true;
    }
    var records = [];
    searchParams.sortFields = [{field: 'createTime', reverse: true, type: 'LONG'}];
    searchParams.start = 0;
    searchParams.limit = 100000;

    var result = RealPayRecordService.searchRealPayRec(searchParams, 0, -1);
    var resultList = result.lists;
    var totalRecords = result.total;

    if (resultList && resultList.length > 0) {
        for (var i = 0; i < resultList.length; i++) {
            var jPres = resultList[i];
            var needPayMoneyAmount = jPres.needPayMoneyAmount;
            var paidMoneyAmount = jPres.paidMoneyAmount;
            jPres.needPayMoneyAmount = (Number(needPayMoneyAmount) / 100).toFixed(2);
            jPres.paidMoneyAmount = (Number(paidMoneyAmount) / 100).toFixed(2);
            jPres.createTimeString = DateUtil.getLongDate(parseInt(jPres.createTime));
            if (jPres.paidTime > 0) {
                jPres.paidTimeString = DateUtil.getLongDate(parseInt(jPres.paidTime));
            } else {
                jPres.paidTimeString = "";
            }

            var payInterfaceId = jPres.payInterfaceId;
            var payInterface = PaymentService.getPayInterface(payInterfaceId);
            if (payInterface) {
                jPres.paymentName = payInterface.payInterfaceName;
            }
            var payState = jPres.payState;
            if (payState == 'paid') {
                jPres.payStateString = "已支付";
            } else {
                jPres.payStateString = "未支付";
            }
            jPres.bankSN = jPres.bankSN || "";
        }
    }
    var export_file_type = "realPayRec";

    var s = Excel.createExcelList(merchantId, fileName, export_file_type, titles, resultList);

    var result = {};
    if (s == "ok") {
        result.state = "ok";
        result.msg = "导出成功！";
    } else {
        result.state = "error";
        result.msg = "导出失败！";
    }
    out.print(JSON.stringify(result));
}());