//#import Util.js
//#import login.js
//#import search.js
//#import pigeon.js
//#import product.js
//#import file.js
//#import order.js
//#import price.js

//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import $oleMobileApi:services/TrialListService.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
;(function () {

    /**
     * 获取商品
     * @param productObjId  不是productId
     */
    var getProduct = function (productObjId) {
        var productObj = tryOutManageServices.getById(productObjId) || "";
        var msg ;
        if (!productObj) {
            msg = productObjId + "没有对应的试用商品！";
            return;
        }

        var productInfo = ProductService.getProduct(productObj.productId) || "";

        if (productInfo) {
            if(productInfo.DynaAttrs.attr_10000){
                var logo = FileService.getFullPath(productInfo.DynaAttrs.attr_10000.value[0].fileId) || "";
            }else{
                msg = productObjId + "商品没有对应的Logo";
                return;
            }
        }

        return {
            name: productInfo.name || "",
            id: productObj.productId || "",
            logo: logo || "",
            freight:productObj.freight || "",
            msg: msg
        }
    };


    var getShowState = function (aliasCode) {
        var orderType = "tryuse";//订单为试用订单
        var qValues = [
            {n: 'aliasCode', v: aliasCode, type: 'text', op: "and"},
            {n: 'orderType', v: orderType, type: 'term', op: "and"}
        ];

        var searchArgs = {
            fetchCount: 1,
            fromPath: 0,
            type: "ORDER",
            sortFields: [
                {
                    field: "createTime",
                    type: "LONG",
                    reverse: true
                }],
            queryArgs: JSON.stringify({
                mode: 'adv',
                q: qValues.length > 0 ? qValues : null
            })
        };

        var searchResult = SearchService.search(searchArgs);

        var orderListInfo = TrialListService.getOrderList(searchResult);
        var orderList = TrialListService.getShowInfo(orderListInfo.orderList);
        var states = orderList[0].states;
        $.log("\n\n  ---->  states ..." + JSON.stringify(states) + "\n\n");
        if (states.processState.state === "p111") {
            return "TA001";//订单已取消
        }

        if (states.payState.state === "p200") {
            return "TA002";//未付款
        }

        //已签收
        if (states.processState.state === "p112") {
            $.log("\n\n  enter p112 ...\n\n");
            $.log("\n\n  ----> states.trialReportState" + states.trialReportState.state + "\n\n");
            if (states.trialReportState.state === "TP001") {
                return "TA003";//试用报告已提交
            }
            if (states.trialReportState.state === "TP002") {
                $.log("\n\n  enter TP002 ...\n\n");
                return "TA004";//试用报告未提交

            }
            if (states.trialReportState.state === "TP003") {
                return "TA005";//试用报告提交超时
            }

        }

        return "TP006";//仍在物流配送中

    };

    var getPostageInfo = function (productObjId) {
        var productObj = tryOutManageServices.getById(productObjId);

        if (productObj) {
            var cash = productObj.cash;
            var integral = productObj.integral;
        }

        return {
            cash: cash || 0,
            integral: integral || 0
        }
    };

    try {
        var userId = $.params.userId || "";
        if (!userId) {
            userId = LoginService.getFrontendUserId();
        }
        Preconditions.checkArgument(userId, "用户没有登录！");

        var pageNum = $.params.pageNum || 1;//页码
        var limit = $.params.limit || 10;//每页数量
        var start = (pageNum - 1) * limit;//查询时从何处开始获取
        var state = $.params.state || "";//审核状态
        var isHistory = $.params.isHistory || "0";//默认查询非历史订单

        var queryAttr = [];
        queryAttr.push({n: "ot", v: "ole_trial_product_ot_index", type: 'term'});
        queryAttr.push({n: 'userId', v: userId, type: 'text', op: 'and'});
        queryAttr.push({n: 'isHistory', v: isHistory, type: 'text', op: 'and'});

        if (state) {
            queryAttr.push({n: 'state', v: state, type: 'text', op: 'and'});
        }

        var sortFields = {
            field: "createDate",
            type: "LONG",
            reverse: true
        };

        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
            sortFields: [
                sortFields],
            queryArgs: JSON.stringify({
                mode: "adv",
                q: queryAttr
            })
        };

        var result = SearchService.search(searchArgs);
        var allCount = result.searchResult.getTotal();  //所有通过关键词查询到的数量
        var idsJavaList = result.searchResult.getLists(); //实际获取的查询出的Id

        $.log("\n\n allCount = " + allCount + "\n\n");
        $.log("\n\n idsJavaList = " + idsJavaList.size() + "\n\n");

        var ids = [];

        for (var i = 0, len = idsJavaList.size(); i < len; i++) {
            var id = idsJavaList.get(i) + "";
            if (id) {
                ids.push(id);
            }
        }

        var list = TrialListService.getListByIds(ids);

        $.log("\n\nlist = " + JSON.stringify(list) + "\n\n");
        var showList = [];
        var msg = [];
        for (var i = 0; i < list.length; i++) {
            // $.log("------> enter for ");
            var trialApplyObj = {};
            try {
                trialApplyObj.id = list[i].id || "";//试用申请id
                trialApplyObj.userId = list[i].userId || "";//用户id
                trialApplyObj.activityId = list[i].activeId || "";//活动id
                trialApplyObj.productObjId = trialApplyObj.activityId + list[i].productId || "";//试用商品id notProductId
                $.log("\n\n productObjId = " + trialApplyObj.productObjId + "\n\n");
                var product = getProduct(trialApplyObj.productObjId);//获取商品

                trialApplyObj.productId = product.id || "";//商品id
                trialApplyObj.productName = product.name || "";//商品名称
                trialApplyObj.productLogo = product.logo || "";//商品logo
                trialApplyObj.freight = product.freight || "";//商品支付方式
                if(product.msg){
                    msg.push(product.msg);
                }
                trialApplyObj.postageInfo = getPostageInfo(trialApplyObj.productObjId) || "";//邮费信息
                trialApplyObj.aliasCode = list[i].orderId || "";//外部订单id，参数名是orderId，实际传过来的是aliasCode
                trialApplyObj.orderId = trialApplyObj.aliasCode ? OrderService.getOrderByAliasCode(trialApplyObj.aliasCode).id : "";//orderId
                trialApplyObj.applyState = list[i].state || "";// 申请状态 0没通过 1通过 2没操作过的
                $.log("\n\n------>" +list[i].isHistory + "\n\n");
                trialApplyObj.isHistory = list[i].isHistory;// 是否历史记录: 0 否 1 是
                trialApplyObj.orderState = trialApplyObj.aliasCode ? getShowState(trialApplyObj.aliasCode) : "";//订单状态
                trialApplyObj.createTime = list[i].createDate;// 创建时间
                if(!product.price){
                    var priceObj=priceService.getPrice(product.priceId);
                    product.price=priceObj;
                }
                var memberPrice = ProductService.getMemberPriceByProductId(product.id);
                trialApplyObj.memberPrice = memberPrice && memberPrice.toFixed(2) || "暂无价格";// 会员价
                trialApplyObj.marketPrice = ProductService.getMarketPrice(product)||"暂无价格";// 市场价
                $.log("\n\n trialApplyObj= " + JSON.stringify(trialApplyObj) + "\n\n");
                showList.push(trialApplyObj);
            } catch (e) {
                $.log("\n\n error  !  " + e.message + "\n\n");
                continue;
            }
        }


        $.log("\n\n end......... " + "\n\n");

        var data = {
            "allCount": allCount,
            "NumOfPage": Math.ceil(allCount / limit),
            "msg": msg,
            "list": showList
        };

        ResponseUtil.success(data);


    } catch (e) {
        ResponseUtil.error(e.message);
    }


})();