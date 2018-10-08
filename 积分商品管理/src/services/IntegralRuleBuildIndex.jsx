//#import pigeon.js
//#import Util.js
//#import search.js
//#import UserUtil.js
//#import user.js
//#import $integralProductManage:services/IntegralRuleService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var obj = IntegralRuleService.getById(id);

        if (obj) {
            var doc = {};
            var createUserId = obj.createUserId;
            if (createUserId) {
                var jUser = UserService.getUser(createUserId);
                if (jUser) {
                    obj.loginId = UserUtilService.getLoginId(jUser);
                    obj.realName = UserUtilService.getRealName(jUser);
                    obj.nickName = UserUtilService.getNickName(jUser);
                }
            }
            doc.id = obj.id;
            doc.productId = obj.productId;
            doc.skuId = obj.skuId;
            doc.realSkuId = obj.realSkuId;
            doc.merchantId = obj.merchantId;
            doc.keyword_text = obj.name + "|" + obj.desc + "|" + obj.realName + "|" + obj.nickName + "|" + obj.loginId + "|" + obj.productId + "|" + obj.skuId + "|" + obj.realSkuId + "|" + obj.merchantId;
            doc.type = obj.type;
            doc.name_text = obj.name;
            doc.desc_text = obj.desc;
            doc.loginId = obj.loginId;
            doc.realName = obj.realName;
            doc.createTime = obj.createTime;
            doc.ot = "integralRule";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);
})();