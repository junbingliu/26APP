//#import Util.js
//#import pigeon.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import user.js
//#import base64.js
//#import NoticeTrigger.js
//#import DESEncryptUtil.js
(function () {
    //这个是发送短信的接口
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }

    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    if (!buyerId) {
        setResultInfo("E1B0001", "用户不存在！");
        return;
    } else {
        var smsValidatingCode = $.params['phoneValidatingCode'];
        var phone = $.params['phoneNumber'];
        if (!phone) {
            setResultInfo("E1B0001", "手机号码不能为空");
            return;
        }
        if (!smsValidatingCode) {
            setResultInfo("E1B0001", "验证码不能通过");
            return;
        }
        var sessionKey = "phoneValidateCode";
        var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
        //只要等于万能验证码，就通过
        if (wnValidateCode && wnValidateCode == smsValidatingCode) {
            //等于万能验证码，直接验证通过
        } else {
            var sessionValidateCode = SessionService.getSessionValue(sessionKey, request);
            if (!sessionValidateCode) {
                setResultInfo("E1B0001", "未发送手机验证码给该手机");
                return;
            }
            var array = sessionValidateCode.split("-");
            if (array.length != 2) {
                setResultInfo("E1B0001", "验证码错误");
                return;
            }
            var nowTime = new Date().getTime();
            var sendTime = array[1];
            if (nowTime - sendTime > 1000 * 60 * 30) {
                SessionService.removeSessionValue(sessionKey);
                setResultInfo("E1B0001", "验证码已失效");
                return;
            }
            if (array[0] != smsValidatingCode) {
                setResultInfo("E1B0001", "验证码错误");
                return;
            }
        }
        var oldUserId = UserService.judgeMemberField(phone);
        if (oldUserId && oldUserId != "null") {
            if (oldUserId != buyerId) {
                setResultInfo("E1B0001", "该手机已经绑定了会员，请解除绑定后重试");
                return;
            } else {
                setResultInfo("E1B0001", "重复绑定");
                return;
            }
        }
        //修改用户手机号码
        var user = UserService.getUser(buyerId);
        if (!user || user == null) {
            setResultInfo("E1B0001", "用户ID不正确");
            return;
        }
        if (user.mobilPhone) {
            setResultInfo("E1B0001", "该会员已绑定过手机号码，不能重复绑定");
            return;
        }
        user.mobilPhone = phone;
        UserService.updateUser(user, buyerId);//保存会员
        UserService.addMemberField(phone, buyerId, "");//保存会员与手机号关联关系
        SessionService.removeSessionValue(sessionKey);//将验证码从session删除
        setResultInfo("S0A00000", "success");
    }
})();