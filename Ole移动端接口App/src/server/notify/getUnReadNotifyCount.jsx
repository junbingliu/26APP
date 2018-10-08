//#import Util.js
//#import login.js
//#import message.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var result = MessageService.getInboxUnReadLetter(loginUserId);
    if (result) {
        ret.data = {
            totalCount: result.totalCount
        };
    } else {
        ret.data = {
            totalCount: 0
        };
    }
    out.print(JSON.stringify(ret));
})();