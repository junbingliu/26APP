//#import Util.js
//#import pigeon.js
//#import card.js
//#import login.js
//#import DESEncryptUtil.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 券取消转赠接口
 */
(function () {
    var cardNo = $.params.cardNo;

    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
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
    var boundUserId = jCard.boundUserId;//绑定的会员
    if (!boundUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13006);
        return;
    }
    if (boundUserId != loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000, "", "非法请求");
        return;
    }
    var presentStatus = jCard.presentStatus || "0";//转赠状态，0：未转赠，1：转赠中，未被领，2：已领取??取消转赠暂时未确定是否需要这个状态
    if (presentStatus == "0") {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13008);
        return;
    }
    if (presentStatus == "2") {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13009);
        return;
    }
    CardService.updateCashCard(jCard.id, "presentStatus", "3");//将券修改为取消转赠

    H5CommonUtil.setSuccessResult();
})();