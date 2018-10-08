//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120001',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var buyerId = jUser.id;//jUser.id;
        var channel = "6";
        var thirdid = buyerId;
        var unionid = buyerId;
        var mobile = $.params.mobile;
        var guestname = $.params.guestname || "";
        var idcard = $.params.idcard || "";
        var cardno = $.params.cardno;
        var shopid = "A0G3";//生产默认a3aa,A00C为uat测试门店id

        if (!mobile || mobile == null) {
            ret.msg = "手机号码不能为空";
            ret.code = "E1B120002";
            out.print(JSON.stringify(ret));
            return;
        }
        if ((guestname == "" || guestname == null) && (idcard == "" || idcard == null)) {
            ret.msg = "用户姓名和身份证号码不能都为空";
            ret.code = "E1B120003";
            out.print(JSON.stringify(ret));
            return;
        }

        var checkObj = {
            channel: channel,
            mobile: mobile,
            shopid: shopid
        };
        /*//调用通过手机号码验证会员信息
        var checkResult = UserService.checkMemberInfoByMobile(checkObj);
        var status = checkResult.status;
        if (status == "0") {
            //flag ==1 flag=1 表示手机号存在  flag=0 表示手机号不存在
            var data = checkResult.data;
            if (data && data.flag == "1") {
                ret.code = "E1B120005";
                ret.msg = "该手机已经绑定过，不能重复绑定";
                out.print(JSON.stringify(ret));
                return;
            }
        }*/



        var paramobj = {
            channel: channel,
            thirdid: thirdid,
            unionid: unionid,
            mobile: mobile,
            guestname: guestname,
            idcard: idcard,
            cardno: cardno,
            shopid: shopid
        }

        var memberobj = UserService.updateBindingMemberCard(paramobj);
        var status = memberobj.status;
        //TODO 为了开发测试 暂时注释掉
        // if (status == "0") {
            ret.code = "S0A00000";
            ret.msg = "绑定会员卡信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        // } else {
        //     ret.code = "E1B120005";
        //     ret.msg = memberobj.msg;
        //     out.print(JSON.stringify(ret));
        // }

    } catch (e) {
        ret.msg = "绑定会员卡信息失败";
        ret.code = "E1B120004";
        out.print(JSON.stringify(ret));
    }

})();

