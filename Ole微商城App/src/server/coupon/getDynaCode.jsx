//#import Util.js
//#import pigeon.js
//#import user.js
//#import card.js
//#import login.js
//#import @server/util/H5CommonUtil.jsx
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import $oleH5Api:services/PosService.jsx

/**
 * 获取券动态码接口
 */
(function () {
    var cardNo = $.params.cardNo;

    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    if (!cardNo) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return
    }
    var jCard = CardService.getCard("card_cardType_coupons_" + cardNo);
    if (!jCard) {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13003);
        return;
    }
    if(jCard.boundUserId != loginUserId){
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000, "", "非法请求");
        return;
    }
    var unionId = jUser.weixinUnionId;
    var dynaCode = PosService.getDynaCode(cardNo, unionId);//券号和会员的unionId
    H5CommonUtil.setSuccessResult({dynaCode: dynaCode});
})();