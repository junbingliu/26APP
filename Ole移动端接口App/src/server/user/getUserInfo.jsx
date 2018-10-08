//#import Util.js
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
        var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!buyerId) {
            buyerId = LoginService.getFrontendUserId();
        }
        //var buyerId = "u_4110001";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
            return;
        } else {
            var user = UserService.getUser(buyerId);
            if (!user || user == null) {
                ret.msg = "用户ID不正确";
                out.println(JSON.stringify(ret));
                return;
            }

            var retuser = {};
            //赋值个人资料信息
            retuser.userimage = user.logo || "";//头像
            retuser.nickname = user.nickName || "";//昵称
            retuser.sex = user.gender || "";//性别
            retuser.mobile = user.mobilPhone || "";//绑定手机号
            retuser.membercardno = user.cardno || "";//会员卡号
            retuser.email = user.email || "";//会员卡号
            retuser.hotty = user.hotty || "";//个人爱好
            retuser.realName = user.realName || "";//真实姓名
            if (user.birthday) {
                try {
                    retuser.birthday = DateUtil.getShortDate(user.birthday);//出生日期
                } catch (e) {
                    retuser.birthday = "";
                }
            } else {
                retuser.birthday = "";//出生日期
            }

            ret.code = "S0A00000";
            ret.msg = "查询个人资料信息成功";
            ret.data = retuser;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "查询个人资料信息失败";
        out.print(JSON.stringify(ret));
    }

})();

