//#import pigeon.js
//#import Util.js

var PayInterfaceService = (function (pigeon) {
    var prefix = "realPayRec";
    var allPaymentList = prefix + "_paymentList";
    var f = {
        payment: function (param) {
            //这是一个类
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.payInterfaceId = data.id;
            self.name = data.name || "";
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
        },
        add: function (param) {
            var id = prefix + "_" + pigeon.getId(prefix + "_payment");
            var payment = new f.payment(param);
            payment.id = id;
            var key = pigeon.getRevertComparableString(payment.createTime / 1000, 13);
            pigeon.addToList(allPaymentList, key, id);
            pigeon.saveObject(id, payment);
            return id;
        },
        getById: function (id) {
            var p = pigeon.getObject(id);
            if (!p) {
                return null;
            }
            else {
                return p;
            }
        },
        list: function (start, limit) {
            return pigeon.getListObjects(allPaymentList, start, limit);
        },
        listCount: function () {
            return pigeon.getListSize(allPaymentList);
        },
        update: function (id, param) {
            var payment = new f.payment(param);
            var old = f.getById(id);
            if (old.createTime) {
                payment.createTime = old.createTime;
            }
            f.delete(id);
            var key = pigeon.getRevertComparableString(payment.createTime / 1000, 13);
            pigeon.addToList(allPaymentList, key, id);
            pigeon.saveObject(id, payment);
        },
        delete: function (id) {
            var payment = f.getById(id);
            if (payment) {
                var key = pigeon.getRevertComparableString(payment.createTime / 1000, 13);
                pigeon.saveObject(id, null);
                pigeon.deleteFromList(allPaymentList, key, id);
                return true;
            }
            return false;
        }
    };
    return f;
})($S);