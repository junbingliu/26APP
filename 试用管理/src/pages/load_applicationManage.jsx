//#import doT.min.js
//#import product.js
//#import Util.js
//#import login.js
//#import user.js
//#import search.js
//#import DateUtil.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
(function () {
    var searchParams = {};
    var productId = $.params["productId"];
    var currentPage = $.params["page"] || 1;
    var merchantId = $.params["m"];
    var activeId = $.params["activeId"];
    var state = $.params["state"];
    var resultList = [];

    if(productId && productId != "-1"){
        searchParams.productId = productId;
    }
    if(activeId && activeId != "-1"){
        searchParams.activeId = activeId;
    }
    if(state && state != "-1"){
        searchParams.state = state;
    }
    var recordType = "申请人数";
    var pageLimit = 10;
    var displayNum = 10;
    var start = (currentPage - 1) * pageLimit;
    var searchArgs = {
        fetchCount: pageLimit,
        fromPath: start
    };
    var qValues = trialProductQuery.getQuery(searchParams);
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
        var record = TrialProductService.getObject(objId);
        if (record != null) {
            record.period = record.beginTime +"-" + record.endTime;
            if(record.state == "1"){
                record.stateName = "审核通过";
            }else if(record.state == "0"){
                record.stateName = "审核不通过";
            }else{
                record.stateName = "待审核";
            }
            record.createTime = DateUtil.getLongDate(record.createDate);
            if(record.applicationTime){
                record.applicationTime = DateUtil.getLongDate(record.applicationTime);
            }
            record.address = "手机号："+record.addressInfo.phone+"</br>地址:"+record.addressInfo.address;
            if(record.controlUser){
                var user = UserService.getUser(record.controlUser);
                var loginId =user.loginId;
                if(!loginId){
                    loginId = user.nickName;
                }
                record.controlUser = loginId;

            }
            user = UserService.getUser(record.userId);
            function name1(name) {
                if(!name){
                    return "";
                }
                var checkinUserName = "";
                if (name.realName) {
                    checkinUserName = name.realName;
                } else if(name.nickName){
                    checkinUserName = name.nickName;
                }else{
                    checkinUserName = name.loginId;
                }
                return checkinUserName;
            }
            record.userName = name1(user);
            var pro = ProductService.getProduct(record.productId);
            record.productName = "";
            if(pro){
                record.productName = pro.htmlname;
                record.columnId = pro.columnId;
            }
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
    var template = $.getProgram(appMd5, "pages/load_applicationManage.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();