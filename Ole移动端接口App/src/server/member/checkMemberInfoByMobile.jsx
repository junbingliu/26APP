//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120024',
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
        var mobile = $.params.mobile;//手机号码
        var shopid = "A00C";//关注门店,a3aa

        if(!mobile || mobile == null){
            ret.msg = "手机号码不能为空";
            ret.code = "E1B120025";
            out.print(JSON.stringify(ret));
            return;
        }
        $.log("mobile="+mobile);
        var jUserKey = UserService.getUserByKey(mobile);
        $.log("jUserKey="+JSON.stringify(jUserKey));
        if(jUserKey){
            var memberidStr = jUserKey.memberid;
            if(memberidStr != null && memberidStr != "" && memberidStr !="0"){
                ret.msg = "该会员卡已与其他账号绑定";
                ret.code = "E1B120028";
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var paramobj = {
            channel:channel,
            mobile:mobile,
            shopid:shopid
        }
        //调用通过手机号码验证会员信息
        var memberobj = UserService.checkMemberInfoByMobile(paramobj);
        var status = memberobj.status;
        //TODO 暂时注释掉
        // if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "通过手机号验证会员信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        // }else{
        //     ret.code = "E1B120026";
        //     ret.msg = memberobj.msg;
        //     out.print(JSON.stringify(ret));
        // }

    } catch (e) {
        ret.msg = "通过手机号验证会员信息失败";
        ret.code = "E1B120027";
        out.print(JSON.stringify(ret));
    }

})();

