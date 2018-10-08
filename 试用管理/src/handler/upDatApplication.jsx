//#import Util.js
//#import $oleMobileApi:server/util/TryUseUtil.jsx
//#import eventBus.js
//#import login.js
//#import NoticeTrigger.js
//#import user.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 此接口用于单个通过申请
 */
(function () {
    var state = $.params["state"];
    var remarks = $.params["remarks"];
    var id = $.params["id"];
    var userId = LoginService.getBackEndLoginUserId();
    var obj = TrialProductService.getObject(id);
    obj.state = state;
    obj.remarks = remarks;
    obj.controlUser = userId;
    obj.applicationTime = new Date().getTime();
    var merchantId = $.getDefaultMerchantId();
    function name1(name) {
        var checkinUserName = "";
        if(name.nickName){
            checkinUserName = name.nickName;
        } else if (name.realName) {
            checkinUserName = name.realName;
        }else{
            checkinUserName = name.loginId;
        }
        return checkinUserName;
    }
    if(state == "1"){//只有通过状态才能进入
        var productObjId = obj.activeId+obj.productId;
        var productObj = tryOutManageServices.getById(productObjId);
        var order = TryUseUtil.addTryUseOrder(obj.userId, obj.productId, obj.activeId,productObj.cash,productObj.integral);//刘阔提供产生试用订单的方法
        if(!obj.orderId){
            obj.orderId =order.aliasCode;
            var user = UserService.getUser(obj.userId);
            var product = ProductService.getProduct(obj.productId);
            var label = {
                "\\[user:name\\]": name1(user),//用户名
                "\\[product:id\\]": obj.productId,//商品id
                "\\[activity:id\\]": obj.activeId,//活动id
                "\\[product:name\\]": product.htmlName,//商品名称
                "messageSubType":"shopping",
                "messagePageType":"tryUseApproval"
            };
            NoticeTriggerService.send(obj.userId, "notice_56300", merchantId, label);
        }
    }
    if(state == "0"){//如果是拒绝的话就进入历史订单
        var ctx = {"id":obj.id};
        EventBusService.fire("TrialApplyNotPass",ctx);
    }
    var ok = TrialProductService.update(obj.id,obj);
    if(ok){
        out.print(JSON.stringify(order));
    }
})();