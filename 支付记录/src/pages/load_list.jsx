//#import pigeon.js
//#import Util.js
//#import login.js
//#import DateUtil.js
//#import user.js
//#import UserUtil.js
//#import artTemplate3.mini.js
//#import PaymentUtil.js
//#import payment.js
//#import realPayRec.js
//#import $realPayRec:libs/PaymentService.jsx

(function () {
    var payInterfaceId = $.params["payInterfaceId"];
    var payState = $.params["payState"];
    var isSearch = false;
    var currentPage = $.params["page"];
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var accountBeginDate = $.params["accountBeginDate"];
    var accountEndDate = $.params["accountEndDate"];
    if (!currentPage) {
        currentPage = 1;
    }

    var payInterfaceIdValue = "";
    var payStateValue = "";
    var keywordValue = "";
    var beginCreateTimeValue = "";
    var endCreateTimeValue = "";

    var searchParams = {};
    //支付方式
    if (payInterfaceId && payInterfaceId != "-1") {
        searchParams.payInterfaceId = payInterfaceId;
        payInterfaceIdValue = payInterfaceId;
        isSearch = true;
    }
    //支付方式
    if (payState && payState != "-1") {
        searchParams.payState = payState;
        payStateValue = payState;
        isSearch = true;
    }
    //支付方式
    if (keyword && keyword != "-1") {
        searchParams.keyword = keyword;
        keywordValue = keyword;
        isSearch = true;
    }
    //开始时间
    if (accountBeginDate && accountBeginDate != "") {
        beginCreateTimeValue = accountBeginDate;
        searchParams.beginPayTime = DateUtil.getLongTime(accountBeginDate + ' 00:00:00');
        isSearch = true;
    }
    //结束时间
    if (accountEndDate && accountEndDate != "") {
        endCreateTimeValue = accountEndDate;
        searchParams.endPayTime = DateUtil.getLongTime(accountEndDate + ' 23:59:59');
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    searchParams.sortFields = [{field:'createTime',reverse:true,type:'LONG'}];
    searchParams.start = start;
    searchParams.limit = pageLimit;
    var result = RealPayRecordService.searchRealPayRec(searchParams, start, pageLimit);
    var resultList = result.lists;
    totalRecords = result.total;

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
            }else{
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
            } /*else if (payState == 'cancelled') {
             jPres.payStateString = "支付取消";
             } else if (payState == 'failed') {
             jPres.payStateString = "支付失败";
             } else if (payState == 'uncertain') {
             jPres.payStateString = "未确定";
             }*/ else {
                jPres.payStateString = "未支付";
            }
        }
    }
    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: recordType,
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };


    searchParams.payState = payStateValue;
    searchParams.keyword = keywordValue;
    searchParams.payInterfaceId = payInterfaceIdValue;
    searchParams.accountBeginDate = beginCreateTimeValue;
    searchParams.accountEndDate = endCreateTimeValue;

    var source = $.getProgram(appMd5, "pages/load_list.jsxp");
    var pageData = {
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId,
        searchParam: searchParams
    };

    var render = template.compile(source);

    out.print(render(pageData));
})();