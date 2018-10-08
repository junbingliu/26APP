//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120006',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var buyerId = jUser.id;//u_4110001

        //查询ncms会员信息
        var memberobj = UserService.getMemberInfo(buyerId);
        var status = memberobj.status;
        if(status == "0"){
            var retobj = memberobj.data;

            ret.code = "S0A00000";
            ret.msg = "查询会员信息成功";
            ret.data = retobj;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B120009";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
            return;
        }

    } catch (e) {
        ret.msg = "查询会员信息失败";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

