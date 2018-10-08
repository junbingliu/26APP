//#import Util.js
//#import login.js
//#import message.js
//#import DateUtil.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var searchArgs = {
        page: 1,
        limit: 1,//只取一条最新
        searchIndex: true,
        messageSubType: 'orderShipping'//订单出库站内信
        //readState: loginUserId + "_0"//未读的 0914现在是读取最新一条，不管是否已读，所以注释该条件
    };
    ret.data = {};
    var shippingResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (shippingResult.totalCount > 0) {
        var msg = shippingResult.recordList[0];
        ret.data.order = {
            messageType: msg.messageSubType,
            messagePageType:msg.messagePageType,
            targetObjId: msg.targetObjId,
            paramObj:msg.paramObj,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
    }
    searchArgs.messageSubType = "live";//直播
    var liveResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (liveResult.totalCount > 0) {
        var msg = liveResult.recordList[0];
        ret.data.live = {
            messageType: msg.messageSubType,
            messagePageType:msg.messagePageType,
            targetObjId: msg.targetObjId,
            paramObj:msg.paramObj,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
    }
    searchArgs.messageSubType = "couponlistinfo";//优惠券
    var liveResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (liveResult.totalCount > 0) {
        var msg = liveResult.recordList[0];
        ret.data.couponlistinfo = {
            messageType: msg.messageSubType,
            messagePageType:msg.messagePageType,
            targetObjId: msg.targetObjId,
            paramObj:msg.paramObj,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
    }
    searchArgs.messageSubType = "publicnotice";//优惠券
    var liveResult = MessageService.getInboxLetter("u_public", searchArgs);
    if (liveResult.totalCount > 0) {
        var msg = liveResult.recordList[0];
        ret.data.publicnotice = {
            messageType: msg.messageSubType,
            messagePageType:msg.messagePageType,
            targetObjId: msg.targetObjId,
            paramObj:msg.paramObj,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
    }
    var productMegs = [];
    searchArgs.messageSubType = "shopping";//购物相关
    var shoppingResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (shoppingResult.totalCount > 0) {
        var msg = shoppingResult.recordList[0];
        ret.data.shopping = {
            messageType: msg.messageSubType,
            messagePageType:msg.messagePageType,
            targetObjId: msg.targetObjId,
            paramObj:msg.paramObj,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
        productMegs.push(msg);
    }
    /*searchArgs.messageSubType = "preSale";//预售
    var preSaleResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (preSaleResult.totalCount > 0) {
        var msg = preSaleResult.recordList[0];
        ret.data.product = {
            targetObjId: msg.targetObjId,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
        productMegs.push(msg);
    }
    searchArgs.messageSubType = "promotion";//促销
    var promotionResult = MessageService.getInboxLetter(loginUserId, searchArgs);
    if (promotionResult.totalCount > 0) {
        var msg = promotionResult.recordList[0];
        ret.data.product = {
            targetObjId: msg.targetObjId,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
        productMegs.push(msg);
    }
    if (productMegs.length > 0) {
        productMegs.sort(function (obj1, obj2) {
            var time1 = DateUtil.getLongTime(obj1.createTime);
            var time2 = DateUtil.getLongTime(obj2.createTime);
            if (time1 < time2) {
                return 1;
            } else if (time1 == time2) {
                return 0;
            } else {
                return -1;
            }
        });
        var msg = productMegs[0];
        ret.data.product = {
            targetObjId: msg.targetObjId,
            content: msg.content,
            title: msg.title,
            sendTime: msg.createTime
        };
    }*/

    out.print(JSON.stringify(ret));
})();