//#import pigeon.js
//#import Util.js
//#import user.js
//#import login.js
//#import DateUtil.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var appStr = $.params["appStr"];
    var param = JSON.parse(appStr);
    var listSize = PreSaleRuleService.getPreSaleOrderListCount(param.id);
    if (listSize > 1) {
        //ret.msg = "该预售规则中已有商品被预定,不能修改。";
        //out.print(JSON.stringify(ret));
        //return;
    }

    var oldRule = PreSaleRuleService.getById(param.id);
    if (!oldRule) {
        ret.msg = "Id参数错误。";
        out.print(JSON.stringify(ret));
        return
    }
    if(oldRule.approveState == "1" || oldRule.approveState == "-1"){
//        ret.msg = "预售规则已审核过，不能修改。";
//        out.print(JSON.stringify(ret));
//        return
    }
    if (!param.name || param.name.trim() == "") {
        ret.msg = "规则名称不能为空。";
        out.print(JSON.stringify(ret));
        return
    }
    if (!param.deposit || param.deposit.trim() == "") {
        ret.msg = "定金不能为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!param.beginTime || param.beginTime.trim() == "") {
        ret.msg = "尾款支付时间不能为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!param.stockingTime || param.stockingTime.trim() === "") {
        ret.msg = "开始发货时间不能为空。";
        return;
    }
    if (!param.depositBeginTime || param.depositBeginTime.trim() == "") {
        ret.msg = "定金开始支付时间不能为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!param.depositEndTime || param.depositEndTime.trim() == "") {
        ret.msg = "定金结束支付时间不能为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    //一次性付清全款
    if(param.type == "3"){
        param.beginTime = param.depositEndTime;
        param.endTime = param.depositEndTime;
        param.deposit = param.totalPrice;
        param.balance = "0";
    }
    var nowTime = DateUtil.getNowTime();//现在时间
    var beginLongTime = DateUtil.getLongTime(param.beginTime);//尾款支付开始时间
    var endLongTime = DateUtil.getLongTime(param.endTime);//尾款支付结束时间
    var depositEndLongTime = DateUtil.getLongTime(param.depositEndTime);//定金支付开始时间
    var depositBeginLongTime = DateUtil.getLongTime(param.depositBeginTime);//定金支付结束时间
    var stockingLongTime = DateUtil.getLongTime(param.stockingTime);//发货时间

    if (depositBeginLongTime > depositEndLongTime) {
        ret.msg = "定金支付开始时间不能大于定金支付结束时间。";
        out.print(JSON.stringify(ret));
        return;
    }

    if (depositEndLongTime > beginLongTime) {
        ret.msg = "定金支付结束时间不能大于尾款开始支付时间。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (beginLongTime < nowTime && beginLongTime != oldRule.beginLongTime && param.type != "3") {
        ret.msg = "尾款支付时间不能早于当前时间。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!param.endTime || param.endTime.trim() == "") {
        ret.msg = "预售结束时间不能为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (beginLongTime > endLongTime) {
        ret.msg = "尾款支付开始时间不能大于尾款支付结束时间。";
        out.print(JSON.stringify(ret));
        return;
    }
    if (param.displayAmount) {
        param.displayAmount = parseInt(param.displayAmount);
    }
    if (stockingLongTime < endLongTime) {
        ret.msg = "开始发货时间不能小于尾款支付时间";
        out.print(JSON.stringify(ret));
        return;
    }
    var type = param.type;
    if (type == "2") {
        if (!param.scope || param.scope.length == 0) {
            ret.msg = "尾款范围不能为空。";
            out.print(JSON.stringify(ret));
            return;
        }
    } else {
        if (!param.totalPrice || param.totalPrice.trim() == "") {
            ret.msg = "预售价不能为空。";
            out.print(JSON.stringify(ret));
            return;
        }
        if (!param.balance || param.balance.trim() == "") {
            ret.msg = "尾款不能为空。";
            out.print(JSON.stringify(ret));
            return;
        }
    }
    if (!param.items || param.items.length == 0) {
        bootbox.alert("商品不能为空。");
        return;
    }
    param.createUserId = loginUserId;
    param.lastModifyUserId = loginUserId;
    var items = param.items;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var productId = item.id;
        var productRule = PreSaleRuleService.getProductPreSaleRule(productId);
        if (productRule) {
            if (productRule && param.id != productRule.id) {
                ret.state = "no";
                ret.msg = "不能对同个商品添加多个预售规则,商品'" + item.name + "'已经在规则'" + productRule.name + "'里!";
                out.print(JSON.stringify(ret));
                return;
            }
        }
    }
    param.mid = m;
    for (var key in param) {
        oldRule[key] = param[key];
    }
    ret.state = "ok";
    try {
        PreSaleRuleService.update(oldRule.id, oldRule);
    } catch (e) {
        ret.state = "no";
        ret.msg = "修改失败,请稍候重试!";
    }
    var taskId = PreSaleRuleService.getTaskId(oldRule.id);
    if (taskId && taskId != "null") {
        JobsService.deleteTask(taskId);
    }
    //加入到尾款支付通知task队列
    var jobPageId = "task/noticePayBalance.jsx";
    var postData = {id: oldRule.id};
    taskId = JobsService.submitTask(appId, jobPageId, postData, beginLongTime);
    PreSaleRuleService.saveTaskId(oldRule.id, taskId);
    out.print(JSON.stringify(ret));
})();