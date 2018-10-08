//#import pigeon.js
//#import Util.js
//#import login.js
//#import search.js
//#import DateUtil.js
//#import user.js
//#import merchant.js
//#import product.js
//#import artTemplate3.mini.js
//#import $integralProductManage:services/IntegralRuleService.jsx
//#import $integralProductManage:services/IntegralRuleLogService.jsx
//#import $integralProductManage:services/IntegralRuleLogQuery.jsx

(function () {
    var keyword = $.params["keyword"];//关键字
    var isSearch = false;
    var currentPage = $.params["page"];//当前页数
    var merchantId = $.params["m"];//商家Id
    var beginCreateTime = $.params["beginCreateTime"];//开始创建时间
    var endCreateTime = $.params["endCreateTime"];//结束创建时间
    if (!currentPage) {
        currentPage = 1;
    }
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }

    var keywordValue = "";
    var beginCreateTimeValue = "";
    var endCreateTimeValue = "";

    var searchParams = {};
    //关键字
    if (keyword) {
        searchParams.keyword = keyword;
        keywordValue = keyword;
        isSearch = true;
    }
    //商家Id
    if (merchantId && merchantId != "head_merchant") {
        searchParams.merchantId = merchantId;
        isSearch = true;
    }
    //开始创建时间
    if (beginCreateTime && beginCreateTime != "") {
        beginCreateTimeValue = beginCreateTime;
        beginCreateTime = beginCreateTime + " 00:00:00";
        searchParams.beginCreateTime = DateUtil.getLongTime(beginCreateTime) + "";
        isSearch = true;
    }
    //结束创建时间
    if (endCreateTime && endCreateTime != "") {
        endCreateTimeValue = endCreateTime;
        endCreateTime = endCreateTime + " 23:59:59";
        searchParams.endCreateTime = DateUtil.getLongTime(endCreateTime) + "";
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var resultList = [];
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        var queryArgs = IntegralRuleLogQuery.getQueryArgs(searchParams);
        //排序条件，按创建时间倒序排
        searchArgs.sortFields = [{
            field: "createTime",
            type: "LONG",
            reverse: true
        }];

        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var result = SearchService.search(searchArgs);//进行搜索
        totalRecords = result.searchResult.getTotal();//搜索到的总数
        var ids = result.searchResult.getLists();//搜索到的ID集合

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = IntegralRuleLogService.getById(objId);
            if (record) {
                resultList.push(record);
            }
        }
    } else {
        totalRecords = IntegralRuleLogService.listCount();//获取列表总数
        //获得所有记录
        resultList = IntegralRuleLogService.list(start, pageLimit);
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
    if (resultList && resultList.length > 0) {
        resultList.forEach(function(log){
            var merchant = MerchantService.getMerchant(log.merchantId);
            log.merchantName = merchant.name_cn;
            var jUser = UserService.getUser(log.createUserId);
            if (jUser) {
                log.loginId = jUser.loginId;
            } else {
                log.loginId = "系统";
            }
            log.operationTypeName = IntegralRuleLogService.getOperationTypeByKey(log.operationType);
            log.typeName = IntegralRuleService.getTypeByKey(log.type);
            log.createTime = DateUtil.getLongDate(log.createTime);
        });
    } else {
        resultList = [];
    }
    $.log("\n\n  ------------- resultList = "+JSON.stringify(resultList)+"  -------------- \n\n\n")
    searchParams.keyword = keywordValue;
    searchParams.beginCreateTime = beginCreateTimeValue;
    searchParams.endCreateTime = endCreateTimeValue;

    var source = $.getProgram(appMd5, "pages/load_log.jsxp");
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