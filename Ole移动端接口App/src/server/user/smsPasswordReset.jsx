//#import Util.js
//#import pigeon.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import user.js
//#import base64.js
//#import DigestUtil.js
//#import DateUtil.js
(function () {
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.modules.user,
        Packages.java.util,
        Packages.java.net
    );
    //这个是短信密码找回接口
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }

    try {
        var smsValidatingCode = $.params['validatingCode'];
        var newPwd = $.params['newPwd'];
        var phone = $.params['phone'];
        if (!smsValidatingCode) {
            setResultInfo("E1B0001", "短信验证码不能为空");
            return;
        }
        if (!newPwd) {
            setResultInfo("E1B0001", "新密码不能为空");
            return;
        }
        var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
        //只要等于万能验证码，就通过
        if (wnValidateCode && wnValidateCode == smsValidatingCode) {
            //等于万能验证码，直接验证通过
        } else {
            var sessionKey = "phoneValidateCode";
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
                setResultInfo("E1B0001", "验证码不一致");
                return;
            }
        }

        var jUser = UserService.getUserByKey(phone);
        if (!jUser) {

            setResultInfo("E1B0001", "该手机号码尚未注册，请先注册");
            return;
        }
        var userId = jUser.id + "";
        var baseGrade = 20;
        if (true) {
            //判断输入密码的类型
            function CharMode(iN) {
                if (iN >= 48 && iN <= 57) //数字
                    return 1;
                if (iN >= 65 && iN <= 90) //大写
                    return 2;
                if (iN >= 97 && iN <= 122) //小写
                    return 4;
                else
                    return 8;
            }

            //bitTotal函数
            //计算密码模式
            function bitTotal(num) {
                var modes = 0;
                for (i = 0; i < 4; i++) {
                    if (num & 1) modes++;
                    num >>>= 1;
                }
                return modes;
            }

            //返回强度级别
            function checkStrong(sPW) {
                if (sPW.length < 6)
                    return 0; //密码太短，不检测级别
                var Modes = 0;
                for (var i = 0; i < sPW.length; i++) {
                    //密码模式
                    Modes |= CharMode(sPW.charCodeAt(i));
                }
                return bitTotal(Modes);
            }

            var s_level = checkStrong(newPwd);
            switch (s_level) {
                case 0:
                case 1:
                    baseGrade = 20;
                    break;
                case 2:
                    baseGrade = 40;
                    break;
                default:
                    baseGrade = 60;
                    break;
            }

        }
        var ran = Math.random() + "";
        var passran = newPwd + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");
        var currentTime = DateUtil.getNowTime();

        jUser["passwordhash"] = passwordsha;
        jUser["random"] = ran;
        jUser["grade"] = baseGrade + "";
        //loggedUser["gradeRecord"] = "1";
        jUser["lastModifiedTime"] = currentTime + "";

        selfApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(jUser), userId);
        setResultInfo("S0A00000", "success");
    } catch (e) {
        setResultInfo("E1B0001", "重置密码失败" + e);
    }

})();