//#import pigeon.js
//#import Util.js
//#import login.js
//#import search.js
//#import DateUtil.js
//#import user.js
//#import UserUtil.js
//#import artTemplate3.mini.js
//#import $appConfig:services/AppConfigLogService.jsx

(function () {
    var isSearch = false;
    var currentPage = $.params["page"];//当前页数
    var merchantId = $.params["m"];//商家Id
    if (!currentPage) {
        currentPage = 1;
    }
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }

    //分页参数 begin
    var recordType = "记录";
    var pageLimit = 10;
    var displayNum = 6;
    var totalRecords = 0;
    var start = (currentPage - 1) * pageLimit;

    var resultList = [];
    totalRecords = AppConfigLogService.listCount();//获取列表总数
    //获得所有记录
    resultList = AppConfigLogService.list(start, pageLimit);

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
        for (var i = 0; i < resultList.length; i++) {
            var jPres = resultList[i];
            if (!jPres || jPres == "null") {
                continue;
            }

            var jUser = UserService.getUser(jPres.createUserId);
            var createUserName = "-";
            if (jUser) {
                createUserName = UserUtilService.getNickName(jUser);
            }
            jPres.createUserName = createUserName;
            if(jPres.createTime) {
                jPres.createTime = DateUtil.getLongDate(parseInt(jPres.createTime));
            }
            if(jPres.data){
                jPres.version = jPres.data && jPres.data.version || "";
            }
        }
    } else {
        resultList = [];
    }

    var source = $.getProgram(appMd5, "pages/load_log.jsxp");
    var pageData = {
        resultList: resultList,
        pageParams: pageParams,
        m: merchantId,
        appId: appId
    };

    var render = template.compile(source);

    out.print(render(pageData));
})();