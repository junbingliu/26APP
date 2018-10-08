//#import Util.js
//#import address.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B0001',
        msg: ""
    };
    try {
        // var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        // if (!buyerId) {
        //     buyerId = LoginService.getFrontendUserId();
        // }
        var buyerId = "u_50000";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
        } else {
            var mobilePhone = $.params.mobile;//注册手机号 mobilPhone
            var actionMethod = $.params.actionMethod || "";//活动类型（creation：开卡、binding：绑卡、activation：激活）

            var paramObj = {
                userId: buyerId,
                mobilePhone: mobilePhone
            };
            var resultObj = UserService.giveOMRewardInfoByActionMethod(paramObj, actionMethod);
            var retObj = {};
            var statusStr = resultObj.status;
            $.log("------open member give reward------" + JSON.stringify(resultObj));
            if (statusStr == "0") {
                retObj = resultObj.data;
                ret.code = "S0A00000";
                ret.msg = "赠送开通会员奖励成功";
                ret.data = retObj;
                out.print(JSON.stringify(ret));
                ret.code = "E1B0003";
                ret.msg = resultObj.msg;
                out.print(JSON.stringify(ret));
            } else {
                ret.code = "E1B0003";
                ret.msg = resultObj.msg;
                out.print(JSON.stringify(ret));
            }

        }
    } catch (e) {
        ret.msg = "赠送开通会员奖励失败";
        ret.code = "E1B0002";
        out.print(JSON.stringify(ret));
    }

})();

