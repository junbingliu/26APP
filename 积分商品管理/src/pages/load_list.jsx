//#import pigeon.js
//#import Util.js
//#import product.js
//#import search.js
//#import artTemplate3.mini.js
//#import $integralProductManage:services/IntegralRuleService.jsx
//#import $integralProductManage:services/IntegralRuleQuery.jsx

(function () {
    var isSearch = false;
    var currentPage = $.params["page"];
    var merchantId = $.params["m"];
    var keyword = $.params["keyword"] || "";
    var beginCreateTime = $.params["beginCreateTime"] || "";
    var endCreateTime = $.params["endCreateTime"] || "";
    var type = $.params["type"] || "";
    if (!currentPage) {
        currentPage = 1;
    }

    var searchParams = {};
    //支付方式
    if (merchantId && merchantId != "head_merchant") {
        searchParams.merchantId = merchantId;
    }
    //商品分类
    if (type && type != "-1") {
        searchParams.type = type;
        isSearch = true;
    }
    //关键字
    if (keyword && keyword != "-1") {
        searchParams.keyword = keyword;
        isSearch = true;
    }
    //开始时间
    if (beginCreateTime && beginCreateTime != "") {
        searchParams.beginCreateTime = DateUtil.getLongTime(beginCreateTime);
        isSearch = true;
    }
    //结束时间
    if (endCreateTime && endCreateTime != "") {
        searchParams.endCreateTime = DateUtil.getLongTime(endCreateTime);
        isSearch = true;
    }
    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 15;
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
        var queryArgs = IntegralRuleQuery.getQueryArgs(searchParams);
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
            var record = IntegralRuleService.getById(objId);
            if (record) {
                resultList.push(record);
            }
        }
    } else {
        totalRecords = IntegralRuleService.listCount();//获取列表总数
        //获得所有记录
        resultList = IntegralRuleService.list(start, pageLimit);
    }
    var cxt = "{attrs:{},factories:[{factory:MF}]}";//市场价
    resultList.forEach(function (record) {
        if (record) {
            var productPrice = ProductService.getPriceValueList(record.productId, "", record.merchantId, 1, cxt, "normalPricePolicy");
            record.marketPrice = productPrice && productPrice[0] && productPrice[0].formatUnitPrice || "暂无价格";
            record.typeName = IntegralRuleService.getTypeByKey(record.type);
        }
    });

    var totalPages = (totalRecords + pageLimit - 1) / pageLimit;
    var pageParams = {
        recordType: recordType,
        pageLimit: pageLimit,
        displayNum: displayNum,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: currentPage
    };


    searchParams.type = type;
    searchParams.keyword = keyword;
    searchParams.merchantId = merchantId;
    searchParams.beginCreateTime = beginCreateTime;
    searchParams.endCreateTime = endCreateTime;

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