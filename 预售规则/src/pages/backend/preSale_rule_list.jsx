//#import pigeon.js
//#import Util.js
//#import login.js
//#import search.js
//#import DateUtil.js
//#import user.js
//#import UserUtil.js
//#import artTemplate3.mini.js
//#import $preSaleRule:libs/preSaleRule.jsx
//#import $preSaleRule:libs/preSaleRuleQuery.jsx

(function () {
    var keyword = $.params["keyword"];
    var isSearch = false;
    var currentPage = $.params["page"];
    var merchantId = $.params["m"];
    var beginCreateTime = $.params["beginCreateTime"];
    var endCreateTime = $.params["endCreateTime"];
    var channel = $.params["channel"];
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
    if (keyword && keyword != "-1") {
        searchParams.keyword = keyword;
        keywordValue = keyword;
        isSearch = true;
    }
    //商家Id
    if (merchantId && merchantId != "head_merchant") {
        searchParams.mid = merchantId;
        isSearch = true;
    }
    //发布渠道
    if (channel && channel != "all") {
        searchParams.channel = channel;
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

    var preSaleRuleList = [];
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        var qValues = PreSaleRuleQuery.getQuery(searchParams);
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
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = PreSaleRuleService.getById(objId);
            if (record) {
                preSaleRuleList.push(record);
            }
        }
    } else {
        totalRecords = PreSaleRuleService.listCount();
        //获得所有记录
        preSaleRuleList = PreSaleRuleService.list(start, pageLimit);
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
    if (preSaleRuleList && preSaleRuleList.length > 0) {
        var createTime = new Date().getTime();
        for (var i = 0; i < preSaleRuleList.length; i++) {
            var jPres = preSaleRuleList[i];

            var jUser = UserService.getUser(jPres.createUserId);
            var createUserName = "-";
            if (jUser) {
                createUserName = UserUtilService.getNickName(jUser);
            }
            var type = jPres.type;
            if (type == "1") {
                jPres.typeName = "先付定金,固定尾款";
            } else if (type == "2") {
                jPres.typeName = "先付定金,尾款按人数定";
            } else if (type == "3") {
                jPres.typeName = "一次性付清全款";
            }
            var approveState = jPres.approveState;
            if (!approveState || approveState == "1") {
                jPres.approveStateName = "审核通过";
            } else if (approveState == "0") {
                jPres.approveStateName = "未审核";
            } else if (approveState == "-1") {
                jPres.approveStateName = "审核不通过";
            } else {
                jPres.approveStateName = "未知";
            }
            var endLongTime = jPres.endLongTime;
            if (endLongTime < createTime) {
                jPres.name = jPres.name + "[<font color='red'>已过期</font>]";
            }
            jPres.createUserName = createUserName;
            jPres.lastmodifiedTime = DateUtil.getLongDate(parseInt(jPres.lastmodifiedTime));
            jPres.createTime = DateUtil.getLongDate(parseInt(jPres.createTime));
        }
    } else {
        preSaleRuleList = [];
    }

    searchParams.keyword = keywordValue;
    searchParams.beginCreateTime = beginCreateTimeValue;
    searchParams.endCreateTime = endCreateTimeValue;

    var source = $.getProgram(appMd5, "pages/backend/preSale_rule_list.jsxp");
    var pageData = {
        resultList: preSaleRuleList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId,
        searchParam: searchParams
    };

    var render = template.compile(source);

    out.print(render(pageData));
})();