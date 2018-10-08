//#import Util.js
//#import pigeon.js
//#import user.js
//#import login.js
//#import session.js
//#import sysArgument.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $freeGetCardControl:services/FreeGetCardUtil.jsx

/**
 * 异业领券活动，根据手机号码判断是否线下会员，没注册的则注册并发券
 */
(function () {
    var activityId = $.params.activityId;//领券活动id
    var name = $.params.name;//姓名
    var mobile = $.params.mobile;//手机号码
    var smsValidatingCode = $.params.validateCode;//手机验证码
    var shopid = $.params.shopId;//门店ID

    if (!mobile || !smsValidatingCode || !name || !activityId || !shopid) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码，在系统参数配置

    var sessionKey = "phoneValidateCode";
    var sessionValidateCode = SessionService.getSessionValue(sessionKey, request);
    if (!sessionValidateCode) {
        H5CommonUtil.setErrorResult(ErrorCode.sms.E1M060001);
        return;
    }
    var validatePhone = SessionService.getSessionValue("phoneValidatePhone", request);//接收短信的手机号码
    if (validatePhone != mobile) {
        H5CommonUtil.setErrorResult(ErrorCode.sms.E1M060014);
        return;
    }
    var array = sessionValidateCode.split("-");
    if (array.length != 2) {
        H5CommonUtil.setErrorResult(ErrorCode.sms.E1M060002);
        return;
    }
    var nowTime = new Date().getTime();
    var sendTime = array[1];
    if (nowTime - sendTime > 1000 * 60 * 30) {
        SessionService.removeSessionValue(sessionKey);
        H5CommonUtil.setErrorResult(ErrorCode.sms.E1M060003);
        return;
    }
    if (array[0] != smsValidatingCode && smsValidatingCode != wnValidateCode) {
        H5CommonUtil.setErrorResult(ErrorCode.sms.E1M060004);
        return;
    }
    var jUserKey = UserService.getUserByKey(mobile);//根据手机号码查看是不是有绑定会员，如果该手机号已绑定到其他会员了，那就不能再绑定到这个会员
    if (jUserKey && jUserKey.id != loginUserId) {
        $.log("...................bind userId:" + jUserKey.id + ",loginUserId:" + loginUserId);
        H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "该手机已经绑定了其他会员");
        return
    }

    var jUser = UserService.getUser(loginUserId);
    //如果用户没有注册成线下会员员，就验证这个手机号码是不是有开卡，如果有开卡就绑定？ 没有就进行开卡操作
    if (!jUser.cardno || !jUser.memberid) {
        var paramobj = {
            channel: "2",
            mobile: mobile,
            shopid: shopid
        };
        //调用通过手机号码验证会员信息
        var memberobj = UserService.checkMemberInfoByMobile(paramobj);
        var status = memberobj.status;
        if (status == "0" && memberobj.data.flag == "0") {//flag=0 表示手机号不存在,flag=1 表示手机号存在
            //手机号不存在表示没有在线下注册成会员，就要进行会员开卡
            paramobj = {
                channel: "2",
                thirdid: loginUserId,
                unionid: jUser.weixinUnionId,
                shopid: shopid,
                guestname: name,
                guestsex: "3",
                mobile: mobile,
                isforce: "0"
            };
            memberobj = UserService.openMemberCard(paramobj);
            status = memberobj.status;
            if (status == "0") {
                if (!jUser.mobilPhone || jUser.mobilPhone != mobile) {
                    if (jUser.mobilPhone) {
                        UserService.removeMemberField(jUser.mobilPhone, loginUserId);//将会员旧的手机号码与会员对象解除绑定
                    }
                    jUser = UserService.getUser(loginUserId);
                    jUser.mobilPhone = mobile;
                    UserService.addMemberField(mobile, loginUserId, "");//将手机号与会员id绑定起来
                    UserService.updateUser(jUser, jUser.id);//修改会员手机号码字段
                }
                $.log("..............会员开卡成功：" + JSON.stringify(memberobj));
            } else {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000002, "", "会员开卡失败，请稍候再试");
                return;
            }
        }
    }
    var jResult1 = FreeGetCardUtil.doGiveCard(jUser.id, activityId, "");//给会员绑定券

    if (jResult1.code == "0") {
        H5CommonUtil.setSuccessResult();
    } else {
        H5CommonUtil.setExceptionResult(jResult1.msg);
    }
})();