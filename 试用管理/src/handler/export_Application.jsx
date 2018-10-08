//#import excel.js
//#import Util.js
//#import DateUtil.js
//#import login.js
//#import user.js
//#import product.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx

/**
 * 根据搜索条件搜索条件导出申请名单
 */

(function () {
    var merchantId = $.params["m"] || $.getDefaultMerchantId();
    var productId = $.params["productId"] || "";
    var state = $.params["state"] || "";
    var activeId = $.params["activeId"] || "";
    var exportName = $.params["fileName"] || (new Date()).getTime() + LoginService.getBackEndLoginUserId();
    var index = 0;
    var titles = [
        {"index": index++, "columnWidth": "22", "field": "userName", "title": "用户昵称"},
        {"index": index++, "columnWidth": "22", "field": "productName", "title": "商品名"},
        {"index": index++, "columnWidth": "22", "field": "contactPerson", "title": "联系人"},
        {"index": index++, "columnWidth": "22", "field": "phone", "title": "联系电话"},
        {"index": index++, "columnWidth": "22", "field": "address", "title": "收货地址"},
        {"index": index++, "columnWidth": "22", "field": "stateName", "title": "审核结果"},
        {"index": index++, "columnWidth": "22", "field": "createTime", "title": "申请时间"},
        {"index": index++, "columnWidth": "22", "field": "activeId", "title": "活动ID"},
        {"index": index++, "columnWidth": "22", "field": "userId", "title": "用户ID"},
        {"index": index++, "columnWidth": "22", "field": "productId", "title": "商品ID"},
        {"index": index++, "columnWidth": "22", "field": "remarks", "title": "备注"}
    ];
    try {
        function name1(name) {
            var checkinUserName = "";
            if (name.realName) {
                checkinUserName = name.realName;//真名
            } else if(name.nickName){
                checkinUserName = name.nickName;//昵称
            }else{
                checkinUserName = name.loginId;//登录id
            }
            return checkinUserName;
        }
        var searchParams = {};
        if(activeId &&activeId != "-1"){
            searchParams.activeId = activeId;
        }
        if(productId &&productId != "-1"){
            searchParams.productId = productId;
        }
        if(state &&state != "-1"){
            searchParams.state = state;
        }
        //根据搜索条件搜出所有的的试用申请
        var searchArgs = {
            fetchCount: 99999,
            fromPath: 0
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
        var ids = result.searchResult.getLists();
        var export_file_type = "applicationProductExport";
        var arry = [];
        //这里是对搜出来的数据进行整理，然后存到数组里
        for(var g = 0; g < ids.size(); g++){
            var objId = ids.get(g);
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
                record.activeName = tryOutManageServices.getById(record.activeId).title;
                if(record.applicationTime){
                    record.applicationTime = DateUtil.getLongDate(record.applicationTime);
                }
                record.phone = record.addressInfo.phone;
                record.address = record.addressInfo.address;
                record.contactPerson = record.addressInfo.userName;
                var user = UserService.getUser(record.userId);
                record.userName = name1(user);
                record.productName = ProductService.getProduct(record.productId).htmlname;
                arry.push(record);
            }
        }
        var s = Excel.createExcelList(merchantId, exportName, export_file_type, titles, arry);
    } catch (e) {
        $.log(e);
    }
    if (s == "ok") {
        out.print(JSON.stringify({param: "ok", msg: "导出成功"}));
    }
})();