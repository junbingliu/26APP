//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import user.js
//#import open-user.js

(function () {

    var merchantId = $.params["m"];
    var keyword = $.params["keyword"];
    var currentPage = $.params["page"];
    if (!currentPage) {
        currentPage = 1;
    }


    //分页参数 begin
    var recordType = "会员";
    var pageLimit = 20;
    var displayNum = 6;
    var searchArgs = {
        "fields": "userId,loginId,email,realName,mobile,identityType,identityTypeName,identityNumber",
        "page": currentPage,
        "page_size": pageLimit
    };
    if (keyword && keyword != "") {
        searchArgs.keyword = keyword;
    }

    var jSearchResult = OpenUserService.getUsers(searchArgs);
    var users = jSearchResult.users;
    var totalRecords = jSearchResult.total;

    var recordList = [];
    for (var k = 0; k < users.length; k++) {
        var jUser = users[k];
        var uId = jUser.userId;

        var jTempUser = UserService.getUser(uId);

        var preDepositRuleValidateTime = "";
        if(jTempUser.preDepositRuleBeginTime){
            preDepositRuleValidateTime += DateUtil.getLongDate(Number(jTempUser.preDepositRuleBeginTime));
        }
        if(jTempUser.preDepositRuleEndTime){
            var preDepositRuleEndTime = DateUtil.getLongDate(Number(jTempUser.preDepositRuleEndTime));
            if(preDepositRuleEndTime != ""){
                preDepositRuleValidateTime += "至" + preDepositRuleEndTime;
            }
        }

        var eWalletAmount = UserService.getUserEWalletMoneyAmount(uId);
        if(eWalletAmount){
            eWalletAmount =( eWalletAmount / 100).toFixed(2);
        }else{
            eWalletAmount=0;
        }

        var userInfo = {};
        userInfo.userId = jUser.userId;
        userInfo.loginId = jUser.loginId;
        userInfo.email = jUser.email;
        userInfo.realName = jUser.realName;
        userInfo.mobile = jUser.mobile;
        userInfo.identityTypeName = jUser.identityTypeName;
        userInfo.identityNumber = jUser.identityNumber || "";
        userInfo.eWalletAmount = eWalletAmount;
        userInfo.preDepositRuleValidateTime = preDepositRuleValidateTime;
        recordList.push(userInfo);
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
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/load_User.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

