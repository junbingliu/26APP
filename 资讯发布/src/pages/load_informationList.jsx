//#import doT.min.js
//#import Util.js
//#import merchant.js
//#import column.js
//#import Info.js
//#import search.js
//#import DateUtil.js

(function () {

    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var currentPage = $.params["page"];
    var beginTime = $.params["beginTime"];
    var endTime = $.params["endTime"];
    var articleId = $.params["articleId"];
    var channel = $.params["channel"];
    var publishState = $.params["state"];
    //var currentPage = $.params["page"];
    //var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }

    var recordType = "资讯条数";
    var pageLimit = 10;
    var displayNum = 10;
    var searchParams = {};
    //上下架状态
    //if (articleId && articleId != "") {
    //    searchParams.publishState = publishState;
    //}
    if (articleId) {
        searchParams.id = articleId;
    }
    if (keyword) {
        searchParams.title = keyword;
    }
    if (channel) {
        searchParams.channel = channel;
    }
    //上下架状态
    if (publishState && publishState != "") {
        searchParams.publishState = parseInt(publishState);
    }
    ////创建开始时间
    if (beginTime && beginTime != "") {
        searchParams.beginCreateTime = beginTime + ' 00:00:00';
    }
    ////创建结束时间
    if (endTime && endTime != "") {
        searchParams.endCreateTime = endTime + ' 23:59:59';
    }
    //searchParams.keyword = "66666";
    //$.log("--------------------------------------------"+JSON.stringify(searchParams));
    //searchParams.clounm = 1;

    var start = (currentPage - 1) * pageLimit;
    var infoList = InfoService.searchInfo(searchParams, start, pageLimit);
    //$.log("------------------infoList--------------------------"+JSON.stringify(infoList))

    var totalRecords = infoList.total;
    infoList = infoList.recordList;
    for (var g = 0; g < infoList.length; g++) {
        var jInfo = infoList[g];
        //判断是否有channel这个字段,没有则修复
        if (jInfo.channel == undefined) {
            jInfo.channel = "";
        } else if (jInfo.channel == "h5") {
            jInfo.channel = "微商城";
        } else if (jInfo.channel == "app") {
            jInfo.channel = "App";
        } else if (jInfo.channel == "all") {
            jInfo.channel = "所有";
        }

        //获取父类columnId
        var parentId = ColumnService.getColumn(jInfo.columnId).parentId || jInfo.columnId;

        //获取优先级
        jInfo.pos = InfoService.getPos(jInfo.objId, parentId, jInfo.merchantId) || "未知";

        //获取分类名称
        var columnName = ColumnService.getColumnNamePath(jInfo.columnId, "c_info_10000", ">") || "未知";
        jInfo.columnName = columnName.replace("所有信息>", "");
        //获取商家信息
        jInfo.merchantName = MerchantService.getMerchant(jInfo.merchantId).name_cn || "未知";

        var infoPublishState = jInfo.noversion && jInfo.noversion.publishLog && jInfo.noversion.publishLog.publishState || "0";
        if (infoPublishState == "0") {
            jInfo.publishStateName = "下架";
        } else {
            jInfo.publishStateName = "上架";
        }
    }
    var totalPages = Math.ceil(totalRecords / pageLimit);
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
        resultList: infoList
    };
    var template = $.getProgram(appMd5, "pages/load_informationList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

