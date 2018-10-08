//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120020',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var channel = "6";//来源渠道
        var memberid = jUser.memberid;//会员编号
        var shopid = jUser.shopid;//开卡门店
        var userid = jUser.id;//用户id
        var cardno = jUser.cardno;//会员卡号
        var paramobj = {
            channel:channel,
            memberid:memberid,
            shopid:shopid,
            userid:userid,
            cardno:cardno
        }
        //调用激活华润通会员接口
        var memberobj = UserService.activeHrtMemberInfo(paramobj);
        var status = memberobj.status;
        // if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "激活华润通信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        // }else{
        //     ret.code = "E1B120022";
        //     ret.msg = memberobj.msg;
        //     out.print(JSON.stringify(ret));
        // }

    } catch (e) {
        ret.msg = "激活华润通信息失败";
        ret.code = "E1B120023";
        out.print(JSON.stringify(ret));
    }

})();

