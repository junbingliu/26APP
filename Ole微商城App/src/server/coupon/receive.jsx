//#import Util.js
//#import pigeon.js
//#import card.js
//#import login.js
//#import DESEncryptUtil.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 领取朋友转赠的卡,需要先登录，接口参数使用des加密一下，解密的key是appConfig_ole.appKey
 */
(function () {
    var param = $.params.data;
    var iv = $.params.iv;//随机数

    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    if (!param) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return
    }
    var appKey = H5CommonUtil.getEncryptAppKey();
    if (!appKey) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000004);
        return
    }
    var codeStr = DESEncryptUtil.decSign(appKey, iv, param) + "";
    if (!codeStr) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000005);
        return;
    }
    try {
        var jCode = JSON.parse(codeStr);
    } catch (e) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001);
        return;
    }
    var cardNo = jCode.cardNo;//券号
    var time = jCode.time;//预留功能，分享连接的创建时间，后期可以用来判断分享链接有效期

    if (!cardNo) {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13002);
        return;
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
    /*if(boundUserId == loginUserId){
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13011);
        return;
    }*/
    var effectedEnd = jCard.effectedEnd || 0;//有效期结束日期
    var nowTime = new Date().getTime();
    if (nowTime > effectedEnd) {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13007);
        return;
    }

    var cardBatchId = jCard.cardBatchId;//卡批次id
    var jCardBatch = CardService.getCardBatch(cardBatchId);//卡批次对象
    if (!jCardBatch) {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13004);
        return;
    }
    var canPresent = jCardBatch.canPresent;
    if (canPresent != "Y") {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13005);
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
    if (presentStatus == "3") {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13012);
        return;
    }
    var jRet = CardService.cardPresent(cardNo, loginUserId);//进行券转赠
    if (jRet.state == "ok") {
        H5CommonUtil.setSuccessResult();
    } else {
        H5CommonUtil.setErrorResult(ErrorCode.voucher.E1B13009, "", jRet.msg);
    }
})();