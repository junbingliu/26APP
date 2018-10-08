//#import pigeon.js
//#import jobs.js

var OleUserBatchMergeService = (function (pigeon) {
    var f = {
        /**
         * 保存订单数据
         * @param jOrder
         */
        saveOrder: function (jOrder) {
            if (!jOrder.id) {
                return;
            }
            pigeon.saveObject(jOrder.id, jOrder);
        },
        /**
         * 保存卡
         * @param jCard
         */
        saveCard: function (jCard) {
            if (!jCard.id) {
                return;
            }
            pigeon.saveObject(jCard.id, jCard);
        },
        /**
         * 保存地址本
         * @param jAddress
         */
        saveAddress: function (jAddress) {
            if (!jAddress.id) {
                return;
            }
            pigeon.saveObject(jAddress.id, jAddress);
        },
        /**
         * 保存会员
         * @param jUser
         */
        saveUser: function (jUser) {
            if (!jUser.id) {
                return;
            }
            pigeon.saveObject(jUser.id, jUser);
        },
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 10);//倒序 11111=00000099999
        }
    };
    return f;
})($S);