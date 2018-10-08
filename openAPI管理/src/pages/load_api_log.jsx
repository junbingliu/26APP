//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import artTemplate3.mini.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var api_id = $.params["api_id"];//关键字
    var api_name = $.params["api_name"];//当前页数
    var serial_no = $.params["serial_no"];//当前页数
    var merchantId = $.params["m"];//商家Id
    var beginCallTime = $.params["beginCallTime"];//开始创建时间
    var endCallTime = $.params["endCallTime"];//结束创建时间
    var currentPage = $.params["page"];//当前页数

    if (!currentPage) {
        currentPage = 1;
    }
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var searchParams = {};
    //apiId
    if (api_id) {
        searchParams.apiId = api_id;
    }
    //api_name
    if (api_name) {
        searchParams.apiName = api_name;
    }
    //serial_no
    if (serial_no) {
        searchParams.serialNo = serial_no;
    }
    //beginCallTime
    if (beginCallTime) {
        searchParams.beginCallTime = beginCallTime;
    }
    //endCallTime
    if (endCallTime) {
        searchParams.endCallTime = endCallTime;
    }
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;
    var resultList = [];
    var msg = "";
    searchParams.start = start;
    searchParams.pageSize = pageLimit;
    var result = OpenAPIUtil.getApiLogList(searchParams);

    function html_encode(str) {
        var s = "";
        if (!str) {
            return "";
        }
        s = str.replace(/</g, "&lt;");
        s = s.replace(/>/g, "&gt;");
        return s;
    }

    if (result) {
        if (result.code == "S0A00000") {
            resultList = result.data.list;
            totalRecords = result.data.totalSize;
            for (var i = 0; i < resultList.length; i++) {
                var jLog = resultList[i];
                jLog.responseData = html_encode(jLog.responseData);
            }
        } else {
            msg = result.msg;
        }
    } else {
        msg = "查询日志出错";
    }
    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: "对接日志",
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };
    var source = $.getProgram(appMd5, "pages/load_api_log.jsxp");
    var pageData = {
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId,
        msg: msg,
        searchParam: {api_id: api_id, api_name: api_name}
    };
    template.config("escape", false);

    var render = template.compile(source);

    out.print(render(pageData));
})();