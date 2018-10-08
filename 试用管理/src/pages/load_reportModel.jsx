//#import doT.min.js
//#import product.js
//#import Util.js
//#import login.js
//#import user.js
//#import search.js
//#import DateUtil.js
//#import column.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $tryOutManage:services/reportModelQuery.jsx
(function () {
    var searchParams = {};
    var columnIds = $.params["columnIds"];
    var currentPage = $.params["page"] || 1;
    var merchantId = $.params["m"];
    var modelId = $.params["modelId"];
    var resultList = [];

    if(columnIds){
        searchParams.columnIds = columnIds;
    }
    if(modelId){
        searchParams.id = "tryOutManage_model"+modelId;
    }
    var recordType = "模板数";
    var pageLimit = 10;
    var displayNum = 10;
    var start = (currentPage - 1) * pageLimit;
    var searchArgs = {
        fetchCount: pageLimit,
        fromPath: start
    };
    var qValues = reportModelQuery.getQuery(searchParams);
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];

    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    var totalRecords = result.searchResult.getTotal();
    var ids = result.searchResult.getLists();
    for (var i = 0; i < ids.size() ; i++) {
        var objId = ids.get(i);
        var record = tryOutManageServices.getById(objId);
        if (record != null) {
            var columnId = record.columnIds.split(",");
            var columnObjs = ColumnService.getColumns(columnId);
            var columnName = "";
            for(var g = 0; g < columnObjs.length; g++){
                if(columnObjs[g]){
                    if(columnName != ","){
                        columnName = columnObjs[g].name;
                    }else{
                        columnName = columnName + "," + columnObjs[g].name;
                    }
                }
            }
            record.columnNames = columnName;
            record.num = record.id.replace("tryOutManage_model_","");
            resultList.push(record);
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

    var pageData = {
        merchantId: merchantId,
        pageParams: pageParams,
        resultList: resultList
    };
    var template = $.getProgram(appMd5, "pages/load_reportModel.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();