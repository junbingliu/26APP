//#import Util.js
//#import order.js
//#import product.js
//#import file.js
//#import pigeon.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $oleMobileApi:services/ProductLikeUtilService.jsx
//#import $oleTrialReport:services/TrialReportService.jsx
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
var TrialListService = (function (pigeon) {
    var prefix = "likes_trialReport"; //前缀
    var f = {};

    var getTrialReportState = function (orderId) {

        var blackListState = BlackListService.getStatusByOrderId(orderId);

        var trialReportState = {};
        trialReportState.state = "TP001";//报告已提交
        if (blackListState) {
            trialReportState.state = "TP003";//提交超时
            return trialReportState;
        }
        var State = TrialReportUtilService.getNumInfoByOrderId(orderId);

        if (!State) {
            trialReportState.state = "TP002";//报告未提交
            return trialReportState;
        }

        return trialReportState;
    };

    var getProductId = function (items) {
        var productIds = [];
        for (var key in items){
            if(items.hasOwnProperty(key)){
                productIds.push(items.key.productId);
            }
        }
        $.log("\n\n productIds = "+JSON.stringify(productIds)+"\n\n");
        return productIds;
    };

    f.saveObj = function (id,obj) {
        pigeon.saveObject(id,obj);
    };


    f.getListByIds = function (ids) {
        if (ids && ids.length > 0) {
            return pigeon.getContents(ids).map(function (info) { //批量返回由字符串组成的列表
                return JSON.parse(info);
            })
        }
        return [];
    };


    f.getShowInfo = function (orderList) {
        var list = [];
        for (var i = 0, len = orderList.length; i < len; i++) {
            var trialOrderObj = {};
            trialOrderObj.orderId = orderList[i].id;//订单id
            trialOrderObj.createTime = orderList[i].createTime;//创建时间
            // trialOrderObj.productId = getProductId(orderList[i].items)[0];//商品id
            //
            // trialOrderObj.productName = ProductService.getProduct(trialOrderObj.productId).name;//商品名称
            // trialOrderObj.productLogo = FileService.getFullPath(ProductService.getProduct(trialOrderObj.productId).DynaAttrs.attr_10000.value[0].fileId);//商品logo
            trialOrderObj.activityId = orderList[i].tryuseActivityId;// 活动id
            trialOrderObj.buyerInfo = orderList[i].buyerInfo;//用户信息
            var states = orderList[i].states;//支付,收货状态
            var trialReportState = getTrialReportState(trialOrderObj.orderId);
            states.trialReportState = trialReportState;
            trialOrderObj.states = states;
            list.push(trialOrderObj);
        }
        return list;

    };

    f.getOrderList = function (searchResult) {
        var resultList = [];
        var ids = searchResult.searchResult.getLists();
        for (var i = 0; i < ids.size(); i++) {
            var objId = ids.get(i);
            var record = OrderService.getOrder(objId);
            if (record) {
                resultList.push(record);
            }
        }
        var orderList = [];
        var totalRecords = 0;
        if (resultList && resultList.length > 0) {
            var orders = resultList;
            totalRecords = searchResult.searchResult.getTotal();
            for (var i = 0; i < orders.length; i++) {
                var jOrder = (orders[i]);
                orderList.push(jOrder);
            }
        }
        return {orderList: orderList, totalRecords: totalRecords}
    };

    return f;
})($S);