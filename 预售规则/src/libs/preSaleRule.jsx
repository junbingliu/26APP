//#import pigeon.js
//#import jobs.js
//#import Util.js
//#import product.js
//#import DateUtil.js
//#import PreSale.js

var PreSaleRuleService = (function (pigeon) {
    var prefix = "preSaleRule";
    var param_id = "preSaleRule_param";
    var allPreSaleRuleList = prefix + "_allPreSaleRule";
    var f = {
        preSaleRule: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.mid = data.mid;
            self.name = data.name;
            self.type = data.type;
            self.rate = data.rate || 1;
            self.approveState = data.approveState || "1";//0：未审核，1：审核通过，-1：审核不通过,兼容旧数据，没有值的默认已审核
            self.displayAmount = data.displayAmount || "";
            self.deposit = data.deposit || "";
            self.balance = data.balance || "";
            self.totalPrice = data.totalPrice || "";
            self.scope = data.scope || "";
            self.createUserId = data.createUserId || "";
            self.desc = data.desc || "";
            self.items = data.items || [];
            self.beginTime = data.beginTime || "";//尾款开始支付时间
            self.endTime = data.endTime || "";//尾款结束时间
            self.depositBeginTime = data.depositBeginTime || "";//定金开始支付时间
            self.depositEndTime = data.depositEndTime || "";//定金结束支付时间
            self.stockingTime = data.stockingTime || ""; //备货开始时间
            self.lastModifyUserId = data.lastModifyUserId || data.createUserId; //最后修改人
            self.approveUserId = data.approveUserId || ""; //审核人
            self.approveTime = data.approveTime || ""; //审核时间
            self.channel = data.channel || []; //发布渠道
            self.deliveryBeginTime = data.deliveryBeginTime || "";//开始发货时间
            self.deliveryEndTime = data.deliveryEndTime || "";//结束发货时间
            var now = new Date();
            if (!self.createTime) {
                self.createTime = now.getTime();
            }
            if (!self.lastmodifiedTime) {
                self.lastmodifiedTime = now.getTime();
            }
            if (self.beginTime) {
                self.beginLongTime = DateUtil.getLongTime(self.beginTime);
            }
            if (self.endTime) {
                self.endLongTime = DateUtil.getLongTime(self.endTime);
            }
            if (self.depositBeginTime) {
                self.depositBeginLongTime = DateUtil.getLongTime(self.depositBeginTime);
            }
            if (self.depositEndTime) {
                self.depositEndLongTime = DateUtil.getLongTime(self.depositEndTime);
            }
            if (self.deliveryBeginTime) {
                self.deliveryBeginLongTime = DateUtil.getLongTime(self.deliveryBeginTime);
            }
            if (self.deliveryEndTime) {
                self.deliveryEndLongTime = DateUtil.getLongTime(self.deliveryEndTime);
            }
        },
        add: function (param) {
            var id = prefix + "_" + pigeon.getId(prefix + "_preSaleRule");
            var preSaleRule = new f.preSaleRule(param);
            preSaleRule.id = id;
            var key = pigeon.getRevertComparableString(preSaleRule.createTime, 13);
            pigeon.addToList(allPreSaleRuleList, key, id);
            pigeon.saveObject(id, preSaleRule);
            var items = preSaleRule.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var productId = item.id;
                var pId = prefix + "_" + productId;
                var obj = {};
                obj.ruleId = id;
                obj.productId = productId;
                obj.type = preSaleRule.type;
                obj.deposit = preSaleRule.deposit;
                obj.balance = preSaleRule.balance;
                obj.totalPrice = preSaleRule.totalPrice;
                obj.scope = preSaleRule.scope;
                obj.beginLongTime = preSaleRule.beginLongTime;
                pigeon.saveObject(pId, obj);
            }
            //设置商品的预售状态为Y，需要在审核通过之后再设置
            //f.updateProduct(preSaleRule, "Y");

            f.buildIndex(id);
            return id;
        },
        updateProduct: function (preSaleRule, state) {
            var items = preSaleRule.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var productId = item.id;
                var product = ProductService.getProduct(productId);
                if (product) {
                    product.isPreSale = state;
                    product.preSaleRuleId = preSaleRule.id;
                    ProductService.updateProduct(productId, product, preSaleRule.createUserId, product.merchantId);
                }
            }
        },
        approve: function (preSaleRule, state) {
            if (!preSaleRule || !state) {
                return;
            }
            preSaleRule.approveState = state;
            f.update(preSaleRule.id, preSaleRule);
        },
        getById: function (id) {
            var p = pigeon.getObject(id);
            if (!p) {
                return null;
            } else {
                return p;
            }
        },
        getProductPreSaleRule: function (productId) {
            var p = pigeon.getObject(prefix + "_" + productId);
            if (!p) {
                return null;
            } else {
                var ruleId = p.ruleId;
                return f.getById(ruleId);
            }
        },
        getProductDeposit: function (productId) {
            //取定金
            var preSaleRule = f.getProductPreSaleRule(productId);
            return preSaleRule && preSaleRule.deposit;
        },
        getProductBalance: function (productId) {
            //取尾款
            var preSaleRule = f.getProductPreSaleRule(productId);
            return PreSaleService.getBalancePrice(preSaleRule, productId);
        },
        getProductTotalPrice: function (productId) {
            //取运费
            var preSaleRule = f.getProductPreSaleRule(productId);
            return PreSaleService.getTotalPrice(preSaleRule, productId);
        },
        list: function (start, limit) {
            return pigeon.getListObjects(allPreSaleRuleList, start, limit);
        },
        listCount: function () {
            return pigeon.getListSize(allPreSaleRuleList);
        },
        update: function (id, param) {
            var preSaleRule = new f.preSaleRule(param);
            var old = f.getById(id);
            if (old.createTime) {
                preSaleRule.createTime = old.createTime;
            }
            f.delete(id);
            var key = pigeon.getRevertComparableString(preSaleRule.createTime, 13);
            pigeon.addToList(allPreSaleRuleList, key, id);
            pigeon.saveObject(id, preSaleRule);
            f.buildIndex(id);
            var items = preSaleRule.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var productId = item.id;
                var pId = prefix + "_" + productId;
                var obj = {};
                obj.ruleId = id;
                obj.productId = productId;
                obj.type = preSaleRule.type;
                obj.deposit = preSaleRule.deposit;
                obj.balance = preSaleRule.balance;
                obj.totalPrice = preSaleRule.totalPrice;
                obj.scope = preSaleRule.scope;
                obj.beginLongTime = preSaleRule.beginLongTime;
                pigeon.saveObject(pId, obj);
            }
            //已审核的才设置成已预售
            if (param.approveState == "1") {
                //设置商品的预售状态为Y
                f.updateProduct(preSaleRule, "Y");
            }
        },
        delete: function (id) {
            var preSaleRule = f.getById(id);
            if (preSaleRule) {
                var key = pigeon.getRevertComparableString(preSaleRule.createTime, 13);
                pigeon.saveObject(id, null);
                pigeon.deleteFromList(allPreSaleRuleList, key, id);
                f.buildIndex(id);
                var items = preSaleRule.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    var productId = item.id;
                    var pId = prefix + "_" + productId;
                    pigeon.saveObject(pId, null);
                }
                f.deleteTaskId(id);
                //设置商品的预售状态为N
                f.updateProduct(preSaleRule, "N");
                return true;
            }
            return false;
        },
        buildIndex: function (id) {
            var jobPageId = "libs/preSaleRuleBuildIndex.jsx";
            JobsService.runNow(appId, jobPageId, {ids: id});
        },
        getParam: function () {
            return f.getById(param_id);
        },
        initParam: function (param) {
            pigeon.saveObject(param_id, param);
            return param_id;
        },
        updateParam: function (param) {
            pigeon.saveObject(param_id, param);
            return param_id;
        },
        getBookAmountKey: function (productId, skuId) {
            var key = productId + "_bookAmount";
            //var key = productId + "_" + skuId + "_bookAmount";
            return key;
        },
        getBookAmount: function (productId, skuId) {
            var key = f.getBookAmountKey(productId, skuId);
            var amount = 0;
            try {
                amount = ps20.getAtom(key);
                if (!amount) {
                    amount = 0;
                    f.setBookAmount(productId, skuId, amount);
                }
            } catch (e) {
                amount = 0;
                f.setBookAmount(productId, skuId, amount);
            }
            return amount;
        },
        updateBookAmount: function (productId, skuId, amount) {
            var key = f.getBookAmountKey(productId, skuId);
            var oldAmount = f.getBookAmount(productId, skuId);
            var newAmount = oldAmount + amount;
            ps20.setAtom(key, newAmount);
        },
        updateDisplayAmount: function (preSaleRule, amount) {
            var oldAmount = preSaleRule.displayAmount || 0;
            var newAmount = Number(oldAmount) + amount;
            preSaleRule.displayAmount = newAmount;
            pigeon.saveObject(preSaleRule.id, preSaleRule);
        },
        setBookAmount: function (productId, skuId, amount) {
            var key = f.getBookAmountKey(productId, skuId);
            ps20.setAtom(key, amount);
        },
        getPreSalePayStateKey: function (orderAliasCode) {
            return prefix + "_" + orderAliasCode + "_payState";
        },
        getPreSalePayState: function (orderAliasCode) {
            return pigeon.getObject(f.getPreSalePayStateKey(orderAliasCode));
        },
        setPreSalePayState: function (orderAliasCode, state) {
            $.log("\n....................orderAliasCode:" + orderAliasCode + "\n");
            $.log("\n....................state:" + state + "\n");
            return pigeon.saveObject(f.getPreSalePayStateKey(orderAliasCode), state);
        },
        //已付定金列表
        getPreSaleDepositPaidListName: function (preSaleId) {
            return preSaleId + "_depositPaidList";
        },
        getPreSaleDepositPaidList: function (preSaleId, start, limit) {
            return pigeon.getList(f.getPreSaleDepositPaidListName(preSaleId), start, limit);
        },
        getPreSaleDepositPaidListCount: function (preSaleId) {
            return pigeon.getListSize(f.getPreSaleDepositPaidListName(preSaleId));
        },
        addOrderToPreSaleDepositPaidList: function (preSaleId, jOrder) {
            if (!preSaleId || !jOrder) {
                return;
            }
            var key = pigeon.getRevertComparableString(jOrder.createTime, 13);
            pigeon.addToList(f.getPreSaleDepositPaidListName(preSaleId), key, jOrder.id);
        },
        deleteOrderFormPreSaleDepositPaidList: function (preSaleId, jOrder) {
            if (!preSaleId || !jOrder) {
                return;
            }
            var key = pigeon.getRevertComparableString(jOrder.createTime, 13);
            pigeon.deleteFromList(f.getPreSaleDepositPaidListName(preSaleId), key, jOrder.id);
        },
        //全部列表
        getPreSaleOrderListName: function (preSaleId) {
            return preSaleId + "_orderList";
        },
        getPreSaleOrderList: function (preSaleId, start, limit) {
            return pigeon.getList(f.getPreSaleOrderListName(preSaleId), start, limit);
        },
        getPreSaleOrderListCount: function (preSaleId) {
            return pigeon.getListSize(f.getPreSaleOrderListName(preSaleId));
        },
        addOrderToPreSaleList: function (preSaleId, jOrder) {
            if (!preSaleId || !jOrder) {
                return;
            }
            var key = pigeon.getRevertComparableString(jOrder.createTime, 13);
            pigeon.addToList(f.getPreSaleOrderListName(preSaleId), key, jOrder.id);
        },
        deleteOrderFormPreSaleList: function (preSaleId, jOrder) {
            if (!preSaleId || !jOrder) {
                return;
            }
            var key = pigeon.getRevertComparableString(jOrder.createTime, 13);
            pigeon.deleteFromList(f.getPreSaleOrderListName(preSaleId), key, jOrder.id);
        },
        getTaskId: function (preSaleRuleId) {
            if (!preSaleRuleId) {
                return null;
            }
            var key = preSaleRuleId + "_task";
            return ps20.getContent(key) + "";
        },
        saveTaskId: function (preSaleRuleId, taskId) {
            if (!preSaleRuleId) {
                return null;
            }
            var key = preSaleRuleId + "_task";
            return ps20.saveContent(key, taskId);
        },
        deleteTaskId: function (preSaleRuleId) {
            if (preSaleRuleId) {
                pigeon.saveObject(preSaleRuleId + "_task", null);
            }
        }
    };
    return f;
})($S);