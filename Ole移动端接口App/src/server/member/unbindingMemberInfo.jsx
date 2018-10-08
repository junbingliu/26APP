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
        var buyerId = jUser.id;

        var channel = "6";//来源渠道
        var thirdid = buyerId;//第三方ID
        var mobile = $.params.mobile;//手机号码
        var memberid = jUser.memberid;//会员编号
        var cardno = jUser.cardno;//会员卡号
        var shopid = jUser.shopid;//开卡门店
        var mobilephone = jUser.mobilPhone;//后台存储手机号码

        var memberobj = UserService.getMemberInfo(jUser.id);
        var status = memberobj.status;
        // if (status == "0") {
        //     var retobj = memberobj.data;
        //     if(retobj.mobile != mobile){
        //         ret.msg = "请输入与本会员卡绑定的手机号码";
        //         ret.code = "E1B120020";
        //         out.print(JSON.stringify(ret));
        //         return;
        //     }
        // } else {
        //     ret.code = "E1B120009";
        //     ret.msg = memberobj.msg;
        //     out.print(JSON.stringify(ret));
        //     return;
        // }

        /*if (mobile != mobilephone) {
            ret.msg = "请输入与本会员卡绑定的手机号码";
            ret.code = "E1B120020";
            out.print(JSON.stringify(ret));
            return;
        }*/

        // if (!memberid || memberid == null) {
        //     ret.msg = "会员编码不能为空";
        //     ret.code = "E1B120017";
        //     out.print(JSON.stringify(ret));
        //     return;
        // }
        var paramobj = {
            channel: channel,
            thirdid: thirdid,
            memberid: memberid,
            cardno: cardno,
            shopid: shopid
        }
        var memberobj = UserService.unBindingMemberCardInfo(paramobj);
        var status = memberobj.status;
        // if (status == "0") {
            ret.code = "S0A00000";
            ret.msg = "会员卡解除绑定成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        // } else {
        //     ret.code = "E1B120019";
        //     ret.msg = memberobj.msg;
        //     out.print(JSON.stringify(ret));
        // }

    } catch (e) {
        ret.msg = "会员卡解除绑定失败";
        ret.code = "E1B120018";
        out.print(JSON.stringify(ret));
    }

})();

