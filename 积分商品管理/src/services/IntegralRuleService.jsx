//#import pigeon.js
//#import jobs.js
//#import Util.js
//#import product.js
//#import $integralProductManage:services/priceUtil.jsx
var     IntegralRuleService = (function (pigeon) {
    var prefix = "integralRule";
    var allIntegralRuleList = prefix + "_allIntegralRule";
    var f = {
            integralRule: function (param) {
                //这是一个类
                var data = param || {};
                var self = this;
                self.id = data.id;
                self.name = data.name;
                self.jifen = data.jifen || "";
                self.money = data.money || "";
                self.freight = data.freight || "0";
                self.createUserId = data.createUserId || "";
                self.desc = data.desc || "";
                self.type = data.type || "";
                self.productId = data.productId || "";
                self.skuId = data.skuId || "";
                self.realSkuId = data.realSkuId || "";
                self.merchantId = data.merchantId || "";
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
                var integralRule = new f.integralRule(param);
                integralRule.id = id;
                var key = pigeon.getRevertComparableString(PriceUtil.toFixed(integralRule.createTime / 1000, 0), 13);
                pigeon.addToList(allIntegralRuleList, key, id);
                pigeon.saveObject(id, integralRule);
                /*每一个商品都保存一个积分规则对象,记录每个商品的 积分,运费,现金金额*/
                // var items = integralRule.items;
                // for (var i = 0; i < items.length; i++) {
                //     var item = items[i];
                //     var productId = item.id;
                //     var pId = prefix + "_" + productId;
                //     var obj = {};
                //     obj.ruleId = id;
                //     obj.productId = productId;
                //     obj.jifen = integralRule.jifen;
                //     obj.money = integralRule.money;
                //     obj.freight = integralRule.freight;
                //     pigeon.saveObject(pId, obj);
                // }
                var productId = integralRule.productId;
                var pId = prefix + "_" + productId;
                var obj = {};
                obj.ruleId = id;
                obj.productId = productId;
                obj.jifen = integralRule.jifen;
                obj.money = integralRule.money;
                obj.freight = integralRule.freight;
                pigeon.saveObject(pId, obj);
                //设置商品的积分换购状态为Y
                f.updateProduct(integralRule, "Y");
                f.buildIndex(id);
                return id;
            },
            updateProduct: function (integralRule, state) {
                // var items = integralRule.items;
                // for (var i = 0; i < items.length; i++) {
                //     var item = items[i];
                //     var productId = item.id;
                //     var product = ProductService.getProduct(productId);
                //     if (product) {
                //         product.isIntegralBuy = state;
                //         product.integralRuleId = integralRule.id;
                //         ProductService.updateProduct(productId, product, integralRule.createUserId, product.merchantId);
                //     }
                // }
                var productId = integralRule.productId;
                var product = ProductService.getProduct(productId);
                if (product) {
                    product.isIntegralBuy = state;
                    product.integralType = integralRule.type;
                    product.integralRuleId = integralRule.id;
                    ProductService.updateProduct(productId, product, integralRule.createUserId, product.merchantId);
                }
            },
            getById: function (id) {
                var p = pigeon.getObject(id);
                if (!p) {
                    return null;
                } else {
                    return p;
                }
            },
            getProductIntegralRule: function (productId) {
                var p = pigeon.getObject(prefix + "_" + productId);
                if (!p) {
                    return null;
                } else {
                    return p;
                }
            },
            getProductIntegralPrice: function (productId) {
                //取积分价
                var integralRule = f.getProductIntegralRule(productId);
                return integralRule && integralRule.jifen;
            },
            getProductCashPrice: function (productId) {
                //取现金价
                var integralRule = f.getProductIntegralRule(productId);
                return integralRule && integralRule.money;
            },
            getProductFreight: function (productId) {
                //取运费
                var integralRule = f.getProductIntegralRule(productId);
                return integralRule && integralRule.freight;
            },
            list: function (start, limit) {
                return pigeon.getListObjects(allIntegralRuleList, start, limit);
            },
            listCount: function () {
                return pigeon.getListSize(allIntegralRuleList);
            },
            update: function (id, param) {
                var integralRule = new f.integralRule(param);
                var old = f.getById(id);
                if (old.createTime) {
                    integralRule.createTime = old.createTime;
                }
                f.delete(id);
                var key = pigeon.getRevertComparableString(PriceUtil.toFixed(integralRule.createTime / 1000, 0), 13);
                pigeon.addToList(allIntegralRuleList, key, id);
                pigeon.saveObject(id, integralRule);
                f.buildIndex(id);
                /*每一个商品都保存一个积分规则对象,记录每个商品的 积分,运费,现金金额*/
                // var items = integralRule.items;
                // for (var i = 0; i < items.length; i++) {
                //     var item = items[i];
                //     var productId = item.id;
                //     var pId = prefix + "_" + productId;
                //     var obj = {};
                //     obj.ruleId = id;
                //     obj.productId = productId;
                //     obj.jifen = integralRule.jifen;
                //     obj.money = integralRule.money;
                //     obj.freight = integralRule.freight;
                //     pigeon.saveObject(pId, obj);
                // }
                var productId = integralRule.productId;
                var pId = prefix + "_" + productId;
                var obj = {};
                obj.ruleId = id;
                obj.productId = productId;
                obj.jifen = integralRule.jifen;
                obj.money = integralRule.money;
                obj.freight = integralRule.freight;
                pigeon.saveObject(pId, obj);
                //设置商品的积分换购状态为Y
                f.updateProduct(integralRule, "Y");
            },
            delete: function (id) {
                var integralRule = f.getById(id);
                if (integralRule) {
                    var key = pigeon.getRevertComparableString(PriceUtil.toFixed(integralRule.createTime / 1000, 0), 13);
                    pigeon.saveObject(id, null);
                    pigeon.deleteFromList(allIntegralRuleList, key, id);
                    f.buildIndex(id);
                    /*每一个商品都保存一个积分规则对象,记录每个商品的 积分,运费,现金金额*/
                    // var items = integralRule.items;
                    // for (var i = 0; i < items.length; i++) {
                    //     var item = items[i];
                    //     var productId = item.id;
                    //     var pId = prefix + "_" + productId;
                    //     pigeon.saveObject(pId, null);
                    // }
                    var productId = integralRule.productId;
                    var pId = prefix + "_" + productId;
                    pigeon.saveObject(pId, null);
                    //设置商品的积分换购状态为Y
                    f.updateProduct(integralRule, "N");
                    return true;
                }
                return false;
            },
            getTypeByKey: function (key) {
                var obj = {
                    "all_integral": "全积分兑换礼品",
                    "all_coupon": "全场代金券",
                    "half_integral": "积分加钱换购商品",
                    "全积分兑换礼品": "all_integral",
                    "全场代金券": "all_coupon",
                    "积分加钱换购商品": "half_integral"
                }
                return obj[key];
            },
            buildIndex: function (id) {
                var jobPageId = "services/IntegralRuleBuildIndex.jsx";
                JobsService.runNow(appId, jobPageId, {ids: id});
            }
        }
    ;
    return f;
})($S);