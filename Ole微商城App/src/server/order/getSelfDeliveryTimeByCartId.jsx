//#import Util.js
//#import login.js
//#import user.js
//#import cart.js
//#import DateUtil.js
//#import open-merchant.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var cartId = $.params.cartId;
    if (!cartId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return
    }

    var jBigCart = CartService.getBigCart();

    var carts = jBigCart.carts;
    var jCart = carts[cartId];

    var cartType = jCart.cartType;

    var items = jCart.items;
    var firstItem = null;
    for (var key in items) {
        firstItem = items[key];
        if (firstItem) {
            break;
        }
    }

    var recordList = [];
    if (firstItem) {
        var productId = firstItem.productId;

        var jProduct = ProductService.getProductWithoutPrice(productId);
        var deliveryWay = jProduct.deliveryWay || "0";

        $.log("\n......................productId=" + productId);
        $.log("\n......................deliveryWay=" + deliveryWay);
        if (deliveryWay == "1") {
            var deliveryBeginTime = jProduct.deliveryBeginTime;
            var deliveryEndTime = jProduct.deliveryEndTime;

            if (deliveryBeginTime && deliveryEndTime) {
                deliveryBeginTime = Number(deliveryBeginTime);
                deliveryEndTime = Number(deliveryEndTime);

                recordList = getRecordList(deliveryBeginTime, deliveryEndTime);
            }
        } else {
            if(cartType == "preSale"){
                var jRule = PreSaleService.getProductPreSaleRule(productId);
                if(jRule){
                    var deliveryBeginTime = jRule.deliveryBeginLongTime;
                    var deliveryEndTime = jRule.deliveryEndLongTime;

                    if (deliveryBeginTime && deliveryEndTime) {
                        deliveryBeginTime = Number(deliveryBeginTime);
                        deliveryEndTime = Number(deliveryEndTime);

                        recordList = getRecordList(deliveryBeginTime, deliveryEndTime);
                    }
                }
            }
        }
    }

    H5CommonUtil.setSuccessResult(recordList);
})();

function getRecordList(deliveryBeginTime, deliveryEndTime) {
    var recordList = [];
    var curTime = new Date().getTime();
    var curDate = DateUtil.getShortDate(curTime);
    var beginDT = DateUtil.getLongTime(curDate + " 23:59:59");

    beginDT = Number(beginDT) + 1000;//最快只能第二天提货
    if(deliveryEndTime > beginDT){
        if(deliveryBeginTime < beginDT){
            //如果开始提货时间小于第二天，则从第二天开始
            deliveryBeginTime = beginDT;
        }
        var timeStampIntervalPerDay = 1000 * 60 * 60 * 24;//一天的时间戳长度
        var allTimeInfo = doFormatTime(deliveryBeginTime, deliveryEndTime);
        var count = (Number(allTimeInfo.endTimeStamp) - Number(allTimeInfo.beginTimeStamp)) / timeStampIntervalPerDay;
        for (var i = 0; i <= count; i++) {
            var date = new Date(Number(allTimeInfo.beginTimeStamp) + timeStampIntervalPerDay * i);
            var Y = date.getFullYear();
            var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
            var D = date.getDate();
            var timeFormat = " 星期" + "日一二三四五六".charAt(date.getDay());
            var recordId = Y + "-" + M + "-" + D;

            var jRecord = {};
            jRecord.id = recordId;
            jRecord.name = recordId + timeFormat;
            recordList.push(jRecord);
        }
    }
    return recordList;
}

function doFormatTime(beginTimeStamp, endTimeStamp) {//返回时间戳区间
    var beginTime = new Date(beginTimeStamp);
    var endTime = new Date(endTimeStamp);
    var Y = beginTime.getFullYear();
    var M = (beginTime.getMonth() + 1 < 10 ? '0' + (beginTime.getMonth() + 1) : beginTime.getMonth() + 1);
    var D = beginTime.getDate();
    var Y2 = endTime.getFullYear();
    var M2 = (endTime.getMonth() + 1 < 10 ? '0' + (endTime.getMonth() + 1) : endTime.getMonth() + 1);
    var D2 = endTime.getDate();

    var bTime = DateUtil.getLongTime(Y + "-" + M + "-" + D + " 00:00:00");
    var eTime = DateUtil.getLongTime(Y2 + "-" + M2 + "-" + D2 + " 00:00:00");
    return {
        beginDate: Y + "-" + M + "-" + D,
        endDate: Y2 + "-" + M2 + "-" + D2,
        beginTimeStamp: bTime,
        endTimeStamp: eTime
    };
}

function timeString(time) {//返回时间格式为：2018-07-2 星期一
    var date = new Date(time);
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';
    var str = "星期" + "日一二三四五六".charAt(date.getDay());
    return Y + M + D + str;
}