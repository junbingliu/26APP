//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var api_id = $.params["api_id"];//关键字
    var api_name = $.params["api_name"];//当前页数
    var merchantId = $.params["m"];//商家Id
    var currentPage = $.params["page"];//当前页数
    var beginCallTime = $.params["beginCallTime"];//开始创建时间
    var endCallTime = $.params["endCallTime"];//结束创建时间
    var groupBy = $.params["groupBy"];//结束创建时间

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
    //beginCallTime
    if (beginCallTime) {
        searchParams.beginCallTime = beginCallTime;
    }
    //endCallTime
    if (endCallTime) {
        searchParams.endCallTime = endCallTime;
    }
    //groupBy
    if (groupBy) {
        searchParams.groupBy = groupBy;
    }
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;
    var resultList = [];
    var msg = "";
    searchParams.start = start;
    searchParams.pageSize = pageLimit;
    var result = OpenAPIUtil.getChart(searchParams);
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
    var newList = [];
    for (var i = 0; i < resultList.length; i++) {
        var chart = resultList[i];
        var newData = {
            apiName: chart.apiName,
            count: chart.count
        };
        newList.push(newData);
    }
    var ret = {
        state: 'ok',
        data: newList,
        total: totalRecords
    };
    out.print(JSON.stringify(ret));
})();