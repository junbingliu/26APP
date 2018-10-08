//#import Util.js
//#import pigeon.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $oleH5Api:services/PosService.jsx
//#import $lotteryEventManage:services/LotteryEventManageService.jsx

;
(function () {
    // A0G3P66620180620000037 最后6位000037是流水号，往前8位20180620是时间戳，往前4位P666是POS机号，剩下前面的是店号
    var listNo = $.params.listNo;//Pos流水号
    var lotteryId = $.params.lotteryId;//抽奖活动id

    if (!listNo || !lotteryId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    if (listNo.length < 18) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "小票号错误");
        return;
    }
    var jLottery = LotteryEventManageService.get(lotteryId);
    if (!jLottery) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "抽奖活动ID错误");
        return;
    }

    var number = listNo.substr(listNo.length - 6, 6);//最后6位000037是流水号
    var time = listNo.substr(listNo.length - 14, 8);//往前8位20180620是时间戳
    var posId = listNo.substr(listNo.length - 18, 4);//往前4位P666是POS机号
    var shopId = listNo.substr(0, listNo.length - 18);//剩下前面的是店号

    if (jLottery.shopId != shopId) {
        $.log("................jLottery.shopId：" + jLottery.shopId + ",shopId:" + shopId);
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "小票销售门店不符");
        return;
    }
    if (jLottery.noSmall == "1") {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "抽奖活动不需要小票");
        return;
    }
    if (!jLottery.lotteryOrderAmount || isNaN(jLottery.lotteryOrderAmount)) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "抽奖活动订单金额设置错误");
        return;
    }

    var posInfo = PosService.getPosInfo(number, posId, shopId, time);
    if (posInfo) {
        var salevalue = posInfo.salevalue;//销售额
        if (salevalue < jLottery.lotteryOrderAmount) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "小票金额(" + salevalue + ")小于抽奖活动订单金额(" + jLottery.lotteryOrderAmount + ")");
            return;
        }
        H5CommonUtil.setSuccessResult();
    } else {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "", "获取小票信息错误");
    }
})();