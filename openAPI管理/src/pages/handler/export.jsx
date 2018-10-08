//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
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
    searchParams.start = 0;
    searchParams.pageSize = 1000;
    var result = OpenAPIUtil.getApiList(searchParams);
    $.log(".....................result:"+JSON.stringify(result));
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
    $.log(".................totalRecords:" + totalRecords);
    for (var i = 0; i < resultList.length; i++) {
        var jApi = resultList[i];
        var str = "INSERT INTO t_apis(api_name,api_id,api_url,api_sys,api_state,content) ";
        str += "VALUES('" + jApi.apiName + "',";
        str += "'" + jApi.apiId + "',";
        str += "'" + jApi.apiUrl + "',";
        str += "'" + jApi.apiSys + "',";
        str += "" + jApi.apiState + ",";
        str += "'" + jApi.content + "');";
        out.print(str + "<br>");
    }
})();