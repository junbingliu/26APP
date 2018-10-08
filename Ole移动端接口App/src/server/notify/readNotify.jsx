//#import Util.js
//#import login.js
//#import message.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var msgId = $.params['id'];//消息id
    if (!msgId) {
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
    var jMsg = MessageService.getMessage(msgId);
    if (!jMsg) {
        ret = ErrorCode.notify.E1M100005;
        out.print(JSON.stringify(ret));
        return;
    }
    var readState = jMsg[loginUserId + "_read"];
    if(readState == "1"){
        ret = ErrorCode.notify.E1M100006;
        out.print(JSON.stringify(ret));
        return;
    }
    MessageService.updateToHaveRead(loginUserId, msgId);
    out.print(JSON.stringify(ret));
})();