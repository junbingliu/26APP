//#import Util.js
//#import login.js
//#import user.js
//#import product.js
//#import NoticeTrigger.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $oleMobileApi:server/util/TryUseUtil.jsx

/**
 * 这是批量拒绝的接口
 */

(function () {
    var result = {
        state: "err"
    };
    var m = $.params.m;
    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        result.msg = "请先登录";
        out.print(JSON.stringify(result));
        return;
    }
    var id = $.params.id;
    if (!id) {
        result.msg = "id不能为空";
        out.print(JSON.stringify(result));
        return;
    }
    var state = $.params.state;
    if (!state) {
        result.msg = "状态不能为空";
        out.print(JSON.stringify(result));
        return;
    }

    function name1(name) {
        var checkinUserName = "";
        if (name.nickName) {
            checkinUserName = name.nickName;
        } else if (name.realName) {
            checkinUserName = name.realName;
        } else {
            checkinUserName = name.loginId;
        }
        return checkinUserName;
    }
    try {
        var obj = TrialProductService.getObject(id);
        if (!obj) {
            result.msg = "ID错误，取不到对应的数据";
            out.print(JSON.stringify(result));
            return;
        }
        if (state == "pass") {
            obj.state = "1";
            var productObj = ProductService.getProduct(obj.productId);
            var productObjId = obj.activeId + obj.productId;
            var productObj1 = tryOutManageServices.getById(productObjId);
            var order = TryUseUtil.addTryUseOrder(obj.userId, obj.productId, obj.activeId, productObj1.cash, productObj1.integral, productObj1.unitPrice || 0);
            if(order.state != "ok"){
                result.msg = order.msg;
                out.print(JSON.stringify(result));
                return;
            }
            $.log("............order:" + JSON.stringify(order));
            //避免重复通过产生异常，或者产生订单的方法出现异常
            if (!obj.orderId) {
                obj.orderId = order.aliasCode;
                var user = UserService.getUser(obj.userId);
                var label = {
                    "\\[user:name\\]": name1(user),//用户名
                    "\\[product:id\\]": obj.productId,//商品id
                    "\\[activity:id\\]": obj.activeId,//活动id
                    "\\[product:name\\]": productObj.htmlName,//商品名称
                    "messageSubType": "shopping",
                    "messagePageType": "tryUseApproval"
                };
                //成功申请以后就发送短信和推送App消息
                NoticeTriggerService.send(obj.userId, "notice_56300", m, label);
            }

            //产生了订单才改变状态
            if (obj.orderId) {
                $.log("obj.orderId" + obj.orderId);
                var ok = TrialProductService.update(obj.id, obj);
            }
        } else {
            obj.state = "0";
            obj.controlUser = userId;
            obj.applicationTime = new Date().getTime();
            obj.remarks = "";
            var ok = TrialProductService.update(obj.id, obj);
        }
        result.state = "ok";
    } catch (e) {
        result.msg = "操作出现异常" + e;
    }
    out.print(JSON.stringify(result));
    return;
})();

function getCell(cells, index) {
    for (var i = 0; i < cells.length; i++) {
        var jCell = cells[i];
        if (jCell.columnIndex == index) {
            return jCell;
        }
    }
    return null;
}