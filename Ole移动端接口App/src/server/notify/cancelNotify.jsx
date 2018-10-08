//#import Util.js
//#import login.js
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
        NoticeNotifyService.deleteNoticeNotify(bindKey);//删除订阅对象
    } else {
        ret = ErrorCode.notify.E1M100007;
        out.print(JSON.stringify(ret));
        return;
    }
    out.print(JSON.stringify(ret));
})();