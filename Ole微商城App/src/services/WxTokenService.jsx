//#import pigeon.js
//#import Util.js

var WxTokenService = (function (pigeon) {
    var prefix = "wechat_";
    var tokenId = "head_merchant_token";
    var ticketId = "head_merchant_ticke";
    var f = {
        saveUserToken: function (wxAppId, accessToken, expires) {
            var id = prefix + tokenId + wxAppId;
            var now = new Date().getTime();
            var expire_time = now + expires * 1000;
            pigeon.saveObject(id, {
                accessToken: accessToken,
                expire_time: expire_time
            });
        },

        getUserToken: function (wxAppId) {

            var id = prefix + tokenId + wxAppId;
            return pigeon.getObject(id);
        },
        saveUserTicket: function (wxAppId, ticket, expires) {
            var id = prefix + ticketId + wxAppId;
            var now = new Date().getTime();
            var expire_time = now + expires * 1000;
            pigeon.saveObject(id, {
                ticket: ticket,
                expire_time: expire_time
            });
        },
        getUserTicket: function (wxAppId) {

            var id = prefix + ticketId + wxAppId;
            return pigeon.getObject(id);
        }
    }


    return f;
})($S);