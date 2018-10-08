//#import Util.js
//#import login.js
//#import rule.js
//#import PreSale.js
//#import product.js
//#import inventory.js
//#import NoticeNotify.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var type = $.params['type'];//类型，如：商品，促销规则，预售等  promotion,live,preSale,arrival
    var objId = $.params['objId'];//订阅的对象，如：商品id，促销规则id，预售商品Id等
    var skuId = $.params['skuId'];//商品的sku编码
    if (!objId || !type) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    //当通知类型是到货通知时，需要传skuId
    if (type == "arrival" && !skuId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    //"notify_key_" + noticeType + "_" + objId + "_" + userId
    var bindKey = NoticeNotifyService.getBindKey(objId, type, loginUserId);
    if (bindKey && bindKey != 'null') {
        ret = ErrorCode.notify.E1M100001;
        out.print(JSON.stringify(ret));
        return;
    }
    if (type == "promotion") {
        var jRule = RuleService.getRule(objId);
        if (!jRule) {
            ret = ErrorCode.notify.E1M100003;
            out.print(JSON.stringify(ret));
            return;
        }
        //已经开始的促销不需要通知
        if (jRule.beginDate < new Date().getTime()) {
            ret = ErrorCode.notify.E1M100004;
            out.print(JSON.stringify(ret));
            return;
        }

    } else if (type == "live") {

    } else if (type == "preSale") {
        var jRule = PreSaleService.getProductPreSaleRule(objId);
        if (!jRule) {
            ret = ErrorCode.notify.E1M100003;
            out.print(JSON.stringify(ret));
            return;
        }
        //已经开始的预售不需要通知
        if (jRule.depositBeginLongTime < new Date().getTime()) {
            ret = ErrorCode.notify.E1M100004;
            out.print(JSON.stringify(ret));
            return;
        }
    } else if (type == "arrival") {
        var jProduct = ProductService.getProduct(objId);
        if (!jProduct) {
            ret = ErrorCode.notify.E1M100003;
            out.print(JSON.stringify(ret));
            return;
        }
        var sellableCount = InventoryService.getSkuSellableCount(objId, skuId);
        if (sellableCount > 0) {
            ret = ErrorCode.notify.E1M100004;
            ret.msg = "商品库存大于0，不需通知";
            out.print(JSON.stringify(ret));
            return;
        }
    } else {
        ret = ErrorCode.notify.E1M100002;
        out.print(JSON.stringify(ret));
        return;
    }
    var notify = {
        objId: objId,
        skuId: skuId || "",
        userId: loginUserId,
        notifyType: type
    };
    var id = NoticeNotifyService.addNoticeNotify(notify);
    out.print(JSON.stringify(ret));
})();