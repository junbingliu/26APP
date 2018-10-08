//#import Util.js
//#import login.js
//#import message.js
//#import DateUtil.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var page = $.params.page || 1;//默认从第1页开始读取
    var limit = $.params.limit || 5;//默认读取5条
    var messageType = $.params.messageType;
    var loginUserId = LoginService.getFrontendUserId();
    if (!messageType) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var searchArgs = {
        page: page,
        limit: limit,
        searchIndex: true,
        messageSubType: messageType/*,
         readState: loginUserId + "_0"//未读的*/
    };
    ret.data = {};
    var result = MessageService.getInboxLetter(loginUserId, searchArgs);
    result.list = [];
    if (result.totalCount > 0) {
        for (var i = 0; i < result.recordList.length; i++) {
            var msg = result.recordList[i];
            var newMsg = {
                id: msg.id,
                messageType: msg.messageSubType,
                messagePageType:msg.messagePageType,
                paramObj:msg.paramObj,
                targetObjId: msg.targetObjId,
                content: msg.content,
                title: msg.title,
                sendTime: msg.createTime
            };
            result.list.push(newMsg);
        }
    }
    var result1 = MessageService.getInboxLetter("u_public", searchArgs);
    if (result1.totalCount > 0) {
        result1.list = [];
        for (var i = 0; i < result1.recordList.length; i++) {
            var msg = result1.recordList[i];
            var newMsg = {
                id: msg.id,
                messageType: msg.messageSubType,
                messagePageType:msg.messagePageType,
                paramObj:msg.paramObj,
                targetObjId: msg.targetObjId,
                content: msg.content,
                title: msg.title,
                sendTime: msg.createTime
            };
            result.list.push(newMsg);
        }
    }
    ret.data = {
        totalCount: result.totalCount+result1.totalCount,
        pageCount: result.pageCount,
        list: result.list
    };

    out.print(JSON.stringify(ret));
})();