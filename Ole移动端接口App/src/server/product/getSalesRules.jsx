//#import Util.js
//#import favorite.js
//#import login.js
//#import json2.js
//#import product.js

/**
 * 提供批量获取商品促销信息的接口
 * @author fuxiao9
 * @date 2017-07-18
 * @email fuxiao9@crv.com.cn
 */
;(function () {
    try {
        var productIds = $.params.productIds || "";
        if (!productIds) {
            setResultInfo("E1B0001", "产品ID不能为空");
            return
        }
        var userId = LoginService.getFrontendUserId();
        userId = userId ? userId : "-1";

        var ruleLabelsMap = {};
        productIds.split(",").forEach(function (productId) {
            $.log("\n\n get product sale rule info -> productId = " + productId + "\n\n");
            var jProduct = ProductService.getProduct(productId); // 查询商品信息
            $.log("\n\n get product sale rule info -> productInfo = " + JSON.stringify(jProduct) + "\n\n");
            var rules = ProductService.getClassifiedPossibleRules(productId, jProduct.merchantId, userId) || {}; // 获取促销规则
            $.log("\n\n get product sale rule info -> roles = " + JSON.stringify(rules) + "\n\n");
            var allRules = [];
            if (!isEmptyArray(rules["coupon"])) {
                allRules = allRules.concat(rules["coupon"]);
            }
            if (!isEmptyArray(rules["gift"])) {
                allRules = allRules.concat(rules["gift"]);
            }
            if (!isEmptyArray(rules["exchange"])) {
                allRules = allRules.concat(rules["exchange"]);
            }
            if (!isEmptyArray(rules["moreCoupon"])) {
                allRules = allRules.concat(rules["moreCoupon"]);
            }
            $.log("\n\n get product sale rule info -> allRules = " + JSON.stringify(allRules) + "\n\n");
            if (!isEmptyArray(allRules)) {
                var ruleLabels = [];
                // 如果不需要在详细页显示，那就删除
                allRules.filter(function (rule) {
                    return rule["displayInProductDetail"]
                }).forEach(function (rule) {
                    $.log("\n\n get product sale rule info -> rule = " + JSON.stringify(rule) + "\n\n");
                    if (ruleLabels.length >= 3) {
                        return true;
                    }
                    var label = transformRuleLabel(rule);
                    $.log("\n\n get product sale rule info -> label = " + JSON.stringify(label) + "\n\n");
                    if (!label) {
                        return true;
                    }
                    if (ruleLabels.indexOf(label) > -1) {
                        return true;
                    }
                    ruleLabels.push(label);
                });
                $.log("\n\n get product sale rule info -> ruleLabels = " + JSON.stringify(ruleLabels) + "\n\n");
                ruleLabelsMap[productId] = ruleLabels;
            }
        });
        setResultInfo("S0A00000", "success", {
            "productRule": ruleLabelsMap
        });
    } catch (e) {
        setResultInfo("E1B0001", "获取数据失败");
        $.log(e);
    }
})();

// 返回函数
function setResultInfo(code, msg, data) {

    // 设置返回格式
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}

/**
 * 判断数组是否为空
 * @param array
 * @return {boolean} true: 空数组, false: 非空素组
 */
function isEmptyArray(array) {
    return !array || (Object.prototype.toString.call(array) === '[object Array]' && array.length === 0);
}

/**
 * 将商品促销标签转换
 * @param r 商品促销对象
 * @return {*}
 */
function transformRuleLabel(r) {
    var rule = r || {};
    var label = null;
    if (rule.type === "pdf" || rule.type === "odf") {
        label = "运费优惠"
    } else if (rule.type === "php") {
        //label = "送积分"
    } else if (rule.type === "pds" || rule.type === "ods") {
        label = "满减"
    } else if (rule.type === "pgc" || rule.type === "OGC") {
        label = "送券"
    } else if (rule.type === "pnds") {
        label = "第N件优惠"
    } else if (rule.type === "OUC" || rule.type === "PUC" || rule.type === "OURC") {
        label = "用券"
    } else if (rule.type === "ppr" || rule.type === "opr") {
        label = "赠品"
    } else if (rule.type === "plpbr" || rule.type === "olpbr") {
        label = "换购"
    }
    return label;
}
