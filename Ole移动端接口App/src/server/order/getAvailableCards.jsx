//#import Util.js
//#import login.js
//#import card.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var userId = LoginService.getFrontendUserId();
    var mycards = CardService.getUserCardList(userId, "cardType_coupons", "0", "-1");
    ret.data = mycards;
    out.print(JSON.stringify(ret));
})();
