//#import Util.js
//#import search.js
//#import order.js
//#import user.js
//#import login.js
//#import merchant.js
//#import DateUtil.js
//#import product.js
//#import UserUtil.js
//#import returnOrder.js
//#import afterSale.js
//#import DateUtil.js
//#import PreSale.js
//#import $oleMobileApi:services/OrderListQuery.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/CartUtil.jsx
//#import $oleMobileApi:services/OleShopService.jsx
;(function () {
    /**扫码购首页信息接口
     *
     * @param code
     * @param msg
     * @param data
     * wupeng
     */
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }

//http://10.0.147.163/oleMobileApi/server/shop/getLocationShopInfo.jsx?lng=114.117298&lat=22.545458
    try {
        var loginUserId = LoginService.getFrontendUserId();//当前登陆用户

        if (!loginUserId) {
            // CommonUtil.setErrCode(res, ErrorCode.order.E1M01001);
            setResultInfo("E1M000003","请先登陆");
            return;
        }

        var aliasCode = $.params.aliasCode;   //订单号
        if (!aliasCode) {
            setResultInfo("E1B0001333","订单号不能为空");
            return;
        }
        var jOrder = OrderService.getOrderByAliasCode(aliasCode);
        var jSmallOrder = {};
        jSmallOrder.orderAliasCode = jOrder.aliasCode;//订单号
        jSmallOrder.posOrderId = (!jOrder.posOrderId) ? "" : jOrder.posOrderId;//订单号
        jSmallOrder.isneedcheck = jOrder.isneedcheck;//是否抽验
        var barCode = "";
        if(jOrder.posOrderId){
            // barCode = jOrder.isneedcheck + "0" + jOrder.posOrderId;
            barCode = jOrder.posOrderId;
        }
        jSmallOrder.barCode = barCode;
        setResultInfo("S0A00000", "success",{"datas":jSmallOrder});
    } catch (e) {
        $.error("查询首页信息失败" + e);
        setResultInfo("E1B0001333","查询首页信息失败" + e);
    }
})();