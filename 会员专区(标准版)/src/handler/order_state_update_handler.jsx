//#import Util.js
//#import login.js
//#import address.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.user,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.java.lang,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.functions.order,
        Packages.net.xinshi.isone.modules.order.bean,
        Packages.net.xinshi.isone.modules.merchant.bean,
        Packages.net.xinshi.isone.modules.order,
        Packages.net.xinshi.isone.modules.order.OrderSearchUtil,
        Packages.net.xinshi.isone.functions.product
    );

    var ret = {
        state:false,
        errorCode:"",
        msg:""
    }
    var toOrderState = null;
    try{
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }
        userId = new selfApi.String(userId);


        var description = new selfApi.StringBuffer();
        description.append("前台修改订单状态<br/>");
        var refundReasonStr = $.params.refundReason;
        var refundReason = -1;
        try {
            refundReason = parseInt(refundReasonStr);
        } catch (e) {
        }
        switch (refundReason) {
            case 1:
                description.append("订单取消原因：现在不想购<br/>");
                break;
            case 2:
                description.append("订单取消原因：支付不成功<br/>");
                break;
            case 3:
                description.append("订单取消原因：商品价格较贵<br/>");
                break;
            case 4:
                description.append("订单取消原因：等待时间过长<br/>");
                break;
            case 5:
                description.append("订单取消原因：有商品缺货<br/>");
                break;
            case 6:
                description.append("订单取消原因：更换或添加新商品<br/>");
                break;
            case 7:
                description.append("订单取消原因：错误或重复下单<br/>");
                break;
            case 8:
                description.append("订单取消原因：其它<br/>");
                break;
        }
        var refundDesc = $.params.refundDesc;
        if (refundDesc) {
            description.append("客户建议:" + refundDesc + "<br/>");
        }
        var orderId = $.params.orderId;
        var toStateType = $.params.toStateType;
        var toState = $.params.toState;
        if (!(userId && orderId && toStateType && toState)) {
            ret.errorCode = "params_error";
            out.print(JSON.stringify(ret));
            return;
        }
        var toOrderStateType = selfApi.OrderStateType.valueOf(toStateType);
        toOrderState = selfApi.OrderState.valueOf(toState);
        var jUpdateStateLog = new selfApi.JSONObject();
        var ip = request.getRemoteAddr() + "";
        jUpdateStateLog.put("ip", ip);
        var jUser = selfApi.IsoneModulesEngine.userService.getUser(userId);
        var realName = selfApi.UserUtil.getRealName(jUser);
        jUpdateStateLog.put("userId", userId);
        jUpdateStateLog.put("realName", realName);
        jUpdateStateLog.put("time", selfApi.System.currentTimeMillis() + "");
        jUpdateStateLog.put("description", description.toString());
        if (jUser == null) {
            ret.errorCode = "user_not_exist";
            out.print(JSON.stringify(ret));
            return;
        }

        var isEnable = jUser.optString("isEnable");
        if (!isEnable.equals(selfApi.Global.USER_ENABLE)) {
            ret.errorCode = "user_not_enable";
            out.print(JSON.stringify(ret));
            return;
        }
        var jOldOrder = selfApi.IsoneOrderEngine.orderService.getOrder(orderId);
        var buyerInfo = jOldOrder.getJSONObject("buyerInfo");
        var buyerUserId = buyerInfo.optString("userId");
        if (!userId.equals(buyerUserId)) {
            //out.print("<script>alert('非法操作，此订单不属于当前登录的会员！');history.back();</script>");
            ret.errorCode = "unlawful_action";
            out.print(JSON.stringify(ret));
            return;
        }

        var oldOrderState = toOrderStateType.getState(jOldOrder);
        jUpdateStateLog.put("oldValue", oldOrderState.getDesc());
        jUpdateStateLog.put("oldValueId", oldOrderState.name());
        var orderState = selfApi.OrderFunction.getOrderBuyerProStateDesc(jOldOrder);
        if (orderState.equals(selfApi.OrderState.p111.getBuyerDesc())) {
            //out.print("<script>alert('您已经取消过此订单，不能重复取消！');location.href='" + contextPath + "/member/newOrderList.jsp';</script>");
            ret.errorCode = "has_cancelled";
            out.print(JSON.stringify(ret));
            return;
        }


        //这里才是修改状态的最核心的方法，其他都只是记录日志而已
        selfApi.IsoneOrderEngine.orderService.updateOrderState(jOldOrder, toOrderStateType, toOrderState, userId, selfApi.MerchantType.user, request);
        var jOrder = selfApi.IsoneOrderEngine.orderService.getOrder(orderId);
        var newOrderState = toOrderStateType.getState(jOrder);
        jUpdateStateLog.put("newValue", newOrderState.getDesc());
        jUpdateStateLog.put("newValueId", newOrderState.name());
        selfApi.IsoneOrderEngine.orderLogService.addLog(orderId, selfApi.OrderLogType.OLT107, jUpdateStateLog);

        ret.state = true;
        ret.errorCode = "";
        out.print(JSON.stringify(ret));
    }catch(e){

        if (toOrderState == selfApi.OrderState.p111) {
            //out.print("<script>alert('抱歉，当前订单不能取消，如需取消订单请联系客服人员。');history.back();</script>");
            ret.errorCode = "can_not_cancel";
        } else {
            //out.print("<script>alert('抱歉，订单状态转换规则不允许这样的状态转换。');history.back();</script>");
            ret.errorCode = "can_not_cancel2";
        }

        ret.state = false;
        //ret.errorCode = "system_error";
        out.print(JSON.stringify(ret));
    }
})();