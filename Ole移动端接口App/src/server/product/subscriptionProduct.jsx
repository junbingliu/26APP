//#import pigeon.js
//#import Util.js
//#import session.js
//#import user.js
//#import @oleMobileApi:server/util/ErrorCode.jsx
//#import $oleMobileApi:services/ArrivalRemindService.jsx

/**
 * 商品到货订阅消息接口
 * @author fuxiao9
 * @date 2017-07-12
 * @email fuxiao9@crv.com.cn
 */
;(function () {

    // 从session中获取登录用户ID, 此处添加从request请求中获取userId, 是为了在测试的时候, 不需要模拟用户登录
    var userId = SessionService.getSessionValue("frontUserId", request) || $.params.userId;
    if (!userId) {
        setResultInfo(ErrorCode.E1M000003.code, ErrorCode.E1M000003.msg);
        return;
    }

    var userInfo = UserService.getUser(userId);
    if (!userInfo) {
        setResultInfo("E1B0001", "获取用户信息失败");
        return;
    }

    var productId = $.params["productId"]; // 获取订阅商品ID
    if (!productId) {
        setResultInfo("E1B0001", "商品订阅ID不能为空");
        return;
    }

    var skuId = $.params["skuId"]; // 获取skuId
    if (!skuId) {
        setResultInfo("E1B0001", "商品skuId不能为空");
        return;
    }

    var arrivalRemindObj = {
        "userId": userId,
        "userName": userInfo["realName"],
        "telephone": userInfo["mobilPhone"],
        "email": userInfo["email"],
        "productId": productId,
        "skuId": skuId
    };

    // 检查用户是否已订阅到货提醒
    var isExists = ArrivalRemindService.checkExists(arrivalRemindObj);

    if (isExists) {
        setResultInfo("S0A00000", "已订阅");
        return;
    }

    // 保存订阅信息
    ArrivalRemindService.addObject(arrivalRemindObj);

    setResultInfo("S0A00000", "订阅成功");
})();


/**
 * 返回客户端方法
 * @param code
 * @param msg
 * @param data
 */
function setResultInfo(code, msg, data) {

    // 设置返回格式
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}