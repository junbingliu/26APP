//#import pigeon.js
//#import jobs.js
//#import Util.js
//#import product.js
//#import $integralProductManage:services/priceUtil.jsx
var IntegralRuleLogService = (function (pigeon) {
    var prefix = "integralRuleLog";
    var allIntegralRuleLogList = prefix + "_allIntegralRuleLog";
    var f = {
            integralRuleLog: function (param) {
                //这是一个类
                var data = param || {};
                var self = this;
                self.id = data.id;
                self.name = data.name;
                self.ruleId = data.ruleId;
                self.beginJifen = data.beginJifen || "";
                self.endJifen = data.endJifen || "";
                self.beginMoney = data.beginMoney || "";
                self.endMoney = data.endMoney || "";
                self.beginFreight = data.beginFreight || "";
                self.endFreight = data.endFreight || "";
                self.createUserId = data.createUserId || "";
                self.type = data.type || "";
                self.productId = data.productId || "";
                self.skuId = data.skuId || "";
                self.realSkuId = data.realSkuId || "";
                self.merchantId = data.merchantId || "";
                self.operationType = data.operationType || "";
                var now = new Date();
                if (!self.createTime) {
                    self.createTime = now.getTime();
                }
                if (!self.lastmodifiedTime) {
                    self.lastmodifiedTime = now.getTime();
                }
            },
            add: function (param) {
                var id = prefix + "_" + pigeon.getId(prefix);
                var integralRuleLog = new f.integralRuleLog(param);
                integralRuleLog.id = id;
                var key = pigeon.getRevertComparableString(PriceUtil.toFixed(integralRuleLog.createTime / 1000, 0), 13);
                pigeon.addToList(allIntegralRuleLogList, key, id);
                pigeon.saveObject(id, integralRuleLog);
                f.buildIndex(id);
                return id;
            },
            getById: function (id) {
                var p = pigeon.getObject(id);
                if (!p) {
                    return null;
                } else {
                    return p;
                }
            },
            list: function (start, limit) {
                return pigeon.getListObjects(allIntegralRuleLogList, start, limit);
            },
            listCount: function () {
                return pigeon.getListSize(allIntegralRuleLogList);
            },
            delete: function (id) {
                var integralRuleLog = f.getById(id);
                if (integralRuleLog) {
                    var key = pigeon.getRevertComparableString(PriceUtil.toFixed(integralRuleLog.createTime / 1000, 0), 13);
                    pigeon.saveObject(id, null);
                    pigeon.deleteFromList(allIntegralRuleLogList, key, id);
                    f.buildIndex(id);
                    return true;
                }
                return false;
            },
            buildIndex: function (id) {
                var jobPageId = "services/IntegralRuleLogBuildIndex.jsx";
                JobsService.runNow(appId, jobPageId, {ids: id});
            },
            getOperationTypeByKey: function (key) {
                var obj = {
                    "add": "添加",
                    "delete": "删除",
                    "update": "修改"
                };
                return obj[key];

            }
        }
    ;
    return f;
})($S);