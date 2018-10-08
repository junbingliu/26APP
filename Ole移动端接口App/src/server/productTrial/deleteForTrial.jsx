//#import Util.js
//#import login.js
//#import address.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
/**
 * 商品试用申请: 清除
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function () {
    
    try {
        
        var result = TrialProductService.search({
            "limit": 100000
        }) || {}; // 获取一个对象ID, 检测用户是否已申请过此活动
        
        result.list.forEach(function(obj){
            TrialProductService.delete(obj.id);
        });
        
        var id = $.params.id || "";
        if (id) {
            TrialProductService.delete(id);
        }
        
        ResponseUtil.success({
            "result": result
        });
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
