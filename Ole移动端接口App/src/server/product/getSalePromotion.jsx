//#import Util.js
//#import product.js
//#import login.js
//#import DateUtil.js
//#import @oleMobileApi:server/util/Preconditions.jsx

/**
 * 获取商品促销活动信息
 * @author fuxiao
 * @email fuxiao9@crv.com.cn
 * @date 2017-07-28
 */

;(function () {
    try {
        var productId = $.params["productId"] || '';
        Preconditions.checkArgument(productId, "商品ID不能为空");

        var userId = LoginService.getFrontendUserId() || "-1"; // 获取登录用户ID
        var productJavaObject = ProductService.getProduct(productId); // 查询商品信息

        // 获取促销规则
        var rules = ProductService.getClassifiedPossibleRules(productId, productJavaObject.merchantId, userId) || {};

        var tempArray = [];
        for (var key in rules) {
            var tempRule = getPriorityHighByInArray(rules[key]);
            if (tempRule && tempRule.displayInProductDetail) {//只返回后台配置的需要显示的促销规则
                tempArray.push(tempRule)
            }
        }
        tempArray = sortRuleByPriority(tempArray);
        if (tempArray && tempArray.length > 0) {
            setResultInfo("S0A00000", "success", {
                rule: tempArray[0]
            });
            return;
        }
        setResultInfo("S0A00000", "success", {
            rule: []
        })
    } catch (e) {
        setResultInfo("E1B0001", e.message)
    }
})();

/**
 * 获取规则中优先级最高的, 如果数组为空, 则返回null
 * @param rules 规则数组
 * @return {*}
 */
function getPriorityHighByInArray(rules) {
    if (rules && rules.length > 0) {
        var newRules = [];
        rules.forEach(function (rule) {
            var beginDate = DateUtil.getLongDate(rule["beginDate"]);
            var endDate = DateUtil.getLongDate(rule["endDate"]);
            var newRule = {
                ruleId: rule["id"],
                name: rule["name"],
                beginDate: beginDate,
                endDate: endDate,
                systemDate: DateUtil.getLongDate(new Date().getTime()),
                priority: rule["priority"],
                displayInProductDetail: rule["displayInProductDetail"]//是否显示
            };
            if (rule && rule.displayInProductDetail) {
                newRules.push(newRule);
            }
        });
        return sortRuleByPriority(newRules)[0]
    }
    return null;
}

/**
 * 根据促销规则的优先级对规则进行排序
 * @param rules
 * @return Array
 */
function sortRuleByPriority(rules) {
    if (rules && rules.length > 0) {
        return rules.sort(function (a, b) {
            return a["priority"] - b["priority"];
        })
    }
    return []
}

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
