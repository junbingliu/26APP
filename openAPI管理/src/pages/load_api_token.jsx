//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import DateUtil.js
//#import artTemplate3.mini.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var token = $.params["token"];//关键字
    var channel = $.params["channel"];//关键字
    var sys = $.params["sys"];//当前页数
    var state = $.params["state"];//当前页数
    var merchantId = $.params["m"];//商家Id
    var currentPage = $.params["page"];//当前页数

    if (!currentPage) {
        currentPage = 1;
    }
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var searchParams = {};
    //channel
    if (channel) {
        searchParams.channel = channel;
    }
    //sys
    if (sys) {
        searchParams.sys = sys;
    }
    //state
    if (state) {
        searchParams.state = state;
    }
    //token
    if (token) {
        searchParams.token = token;
    }
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;
    var resultList = [];
    var msg = "";
    searchParams.start = start;
    searchParams.pageSize = pageLimit;
    var result = OpenAPIUtil.getApiTokenList(searchParams);

    if (result) {
        if (result.code == "S0A00000") {
            resultList = result.data.list;
            totalRecords = result.data.totalSize;
            for (var i = 0; i < resultList.length; i++) {
                var jLog = resultList[i];
                jLog.beginTime = DateUtil.getLongDate(jLog.beginTime);
                jLog.endTime = DateUtil.getLongDate(jLog.endTime);
            }
        } else {
            msg = result.msg;
        }
    } else {
        msg = "查询出错";
    }
    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: "token",
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };
    var source = $.getProgram(appMd5, "pages/load_api_token.jsxp");
    var pageData = {
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId,
        msg: msg,
        searchParam: {sys: sys, channel: channel,token:token}
    };
    template.config("escape", false);

    var render = template.compile(source);

    out.print(render(pageData));
})();