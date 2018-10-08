//#import doT.min.js
//#import Util.js
//#import user.js
//#import DateUtil.js
//#import UserUtil.js
//#import search.js
//#import file.js
//#import $IDCardLib:services/IDCardLibService.jsx
//#import $IDCardLib:services/IDCardLibQuery.jsx


(function () {

    var merchantId = $.params["m"];
    var t = $.params["t"];
    var currentPage = $.params["page"];
    var keyword = $.params["keyword"];
    if (!currentPage) {
        currentPage = 1;
    }

    var isSearch = false;
    var searchParams = {};
    //关键字
    if (keyword && keyword != "") {
        searchParams.keyword = keyword;
        isSearch = true;
    }
    if (t && t == "needCertify") {
        searchParams.certifyState = "0";
        isSearch = true;
    }

    var recordType = "身份证";
    var pageLimit = 20;
    var displayNum = 10;
    var totalRecords = 0;//总数量
    var start = (currentPage - 1) * pageLimit;

    var listData = [];
    if (isSearch) {
        //进入搜索
        var searchArgs = {
            fetchCount: pageLimit,
            fromPath: start
        };
        searchArgs.sortFields = [{
            field:"createTime",
            type:'LONG',//STRING
            reverse:true
        }];

        searchArgs.queryArgs = IDCardLibQuery.getQueryArgs(searchParams);
        var result = SearchService.search(searchArgs);
        totalRecords = result.searchResult.getTotal();
        var ids = result.searchResult.getLists();

        for (var k = 0; k < ids.size(); k++) {
            var objId = ids.get(k);
            var record = IDCardLibService.getIdCard(objId);
            if (record) {
                listData.push(record);
            }
        }
    } else {
        totalRecords = IDCardLibService.getAllIdCardListSize();
        listData = IDCardLibService.getAllIdCardList(start, pageLimit);
    }

    var recordList = [];
    for (var i = 0; i < listData.length; i++) {
        var jRecord = listData[i];
        if (!jRecord) {
            continue;
        }

        var formatCreateTime = "";
        if (jRecord.createTime && jRecord.createTime != "") {
            formatCreateTime = DateUtil.getLongDate(jRecord.createTime);
        }
        jRecord.formatCreateTime = formatCreateTime;

        var createUserName = "";
        var jUser = UserService.getUser(jRecord.createUserId);
        if(jUser){
            createUserName = UserUtilService.getRealName(jUser);
        }
        jRecord.createUserName = createUserName;

        jRecord.userId = jRecord.userId || "";

        var idCardFrontPic = jRecord.idCardFrontPic;
        var idCardBackPic = jRecord.idCardBackPic;
        if(idCardFrontPic && idCardFrontPic != ""){
            jRecord.idCardFrontPic = FileService.getFullPath(idCardFrontPic);
            jRecord.idCardFrontPic60 = FileService.getRelatedUrl(idCardFrontPic, "60X37");
        }
        if(idCardBackPic && idCardBackPic != ""){
            jRecord.idCardBackPic = FileService.getFullPath(idCardBackPic);
            jRecord.idCardBackPic60 = FileService.getRelatedUrl(idCardBackPic, "60X37");
        }

        var isDeedCertify = false;
        var newIdCardFrontPic = jRecord.newIdCardFrontPic;
        var newIdCardBackPic = jRecord.newIdCardBackPic;
        if(newIdCardFrontPic && newIdCardFrontPic != ""){
            jRecord.newIdCardFrontPic = FileService.getFullPath(newIdCardFrontPic);
            jRecord.newIdCardFrontPic60 = FileService.getRelatedUrl(newIdCardFrontPic, "60X37");
            isDeedCertify = true;
        }
        if(newIdCardBackPic && newIdCardBackPic != ""){
            jRecord.newIdCardBackPic = FileService.getFullPath(newIdCardBackPic);
            jRecord.newIdCardBackPic60 = FileService.getRelatedUrl(newIdCardBackPic, "60X37");
            isDeedCertify = true;
        }

        jRecord.isDeedCertify = isDeedCertify;
        recordList.push(jRecord);
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
        t: t,
        pageParams: pageParams,
        recordList: recordList
    };

    var template = $.getProgram(appMd5, "pages/load_record.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
