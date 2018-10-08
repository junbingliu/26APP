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
        var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!buyerId) {
            buyerId = LoginService.getFrontendUserId();
        }
        //var buyerId = "u_4110001";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
        } else {
            var logo = $.params.userimage;//头像 logo
            var nickName = $.params.nickname;//昵称 nickName
            var gender = $.params.sex;//性别 gender
            var birthday = $.params.birthday;//出生日期 birthday 长整型 1498838400000
            var email = $.params.email;//邮箱地址
            var hotty = $.params.hotty;//个人爱好
            var mobilPhone = $.params.mobile;//绑定手机号 mobilPhone

            var user = UserService.getUser(buyerId);
            if (!user || user == null) {
                ret.msg = "用户ID不正确";
                out.println(JSON.stringify(ret));
                return;
            }
            if (birthday) {
                try {
                    //转换成长整型
                    birthday = DateUtil.getLongTime(birthday);
                } catch (e) {
                }
            }
            //赋值个人资料信息
            user.logo = logo;
            user.nickName = nickName;
            user.gender = gender;
            user.birthday = birthday;
            user.email = email;
            user.hotty = hotty;
            user.mobilPhone = mobilPhone;

            UserService.updateUser(user, buyerId);
            //统计修改个人资料数据
            //StatisticsUtil.track(buyerId, "save_userinfo", {});
            ret.code = "S0A00000";
            ret.msg = "修改个人资料信息成功";
            ret.data = buyerId;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "修改个人资料信息失败";
        ret.code = "E1B0002";
        out.print(JSON.stringify(ret));
    }

})();

