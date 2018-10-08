//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import artTemplate3.mini.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var api_id = $.params["api_id"];//关键字
    var api_name = $.params["api_name"];//当前页数
    var merchantId = $.params["m"];//商家Id
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
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;
    var resultList = [];
    var msg = "";
    searchParams.start = start;
    searchParams.pageSize = pageLimit;
    var result = OpenAPIUtil.getApiList(searchParams);
    if (result) {
        if (result.code == "S0A00000") {
            resultList = result.data.list;
            totalRecords = result.data.totalSize;
        } else {
            msg = result.msg;
        }
    } else {
        msg = "查询API列表";
    }
    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: "API列表",
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };
    var source = $.getProgram(appMd5, "pages/load_api.jsxp");
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