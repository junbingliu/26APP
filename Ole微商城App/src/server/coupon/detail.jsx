//#import Util.js
//#import pigeon.js
//#import card.js
//#import user.js
//#import login.js
//#import file.js
//#import DateUtil.js
//#import DESEncryptUtil.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx


/**
 * 获取转赠券的详情页
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
    var presentUserName = "";
    if (presentStatus == "2") {
        var jUser = UserService.getUser(boundUserId);
        if (jUser) {
            presentUserName = jUser.realName || jUser.loginId || jUser.mobilPhone || jUser.id;
        } else {
            presentUserName = boundUserId
        }
    }
    var beginDate = DateUtil.getLongDate(jCard.effectedBegin);
    var endDate = DateUtil.getLongDate(jCard.effectedEnd);
    /*var isCurrentUser = loginUserId == boundUserId ? "Y" : "N";
    if(presentStatus == "2"){
        isCurrentUser = loginUserId == jCard.presentUserId ? "Y" : "N";
    }*/
    var fileId = jCardBatch.fileId;
    if(fileId){
        jCardBatch.imgUrl = FileService.getFullPath(fileId) || "";
    }
    var data = {
        cardNo: cardNo,
        boundUserId: boundUserId,//当前绑定的人id，如果被领取了，则是领券人的id，如果没有被领取，则是发起人的id
        presentUserId: jCard.presentUserId || boundUserId,//发起转赠人的Id
        isCurrentUser: jCard.presentUserId == boundUserId ? "Y" : "N",//是不是被本人领取的
        presentStatus: presentStatus,
        presentUserName: presentUserName,//领取人
        outerName: jCardBatch.outerName,
        desc: jCardBatch.desc,
        imgUrl: jCardBatch.imgUrl,
        effectedBegin: beginDate && beginDate.split(" ")[0],
        effectedEnd: endDate && endDate.split(" ")[0],
    };
    H5CommonUtil.setSuccessResult(data);
})();