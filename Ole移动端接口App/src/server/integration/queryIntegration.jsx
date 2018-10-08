//#import Util.js
//#import login.js
//#import user.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B130001',
        msg: ""
    };
    try {
        var memberid = $.params.memberid;

        if(!memberid || memberid == null){
            ret.msg = "会员编码不能为空";
            ret.code = "E1B130002";
            out.print(JSON.stringify(ret));
            return;
        }
        var memberobj = UserService.queryIntegration(memberid);
        var status = memberobj.status;
        if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "查询会员积分信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B130003";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
            return;
        }

    } catch (e) {
        ret.msg = "查询会员积分信息失败";
        ret.code = "E1B130004";
        out.print(JSON.stringify(ret));
    }

})();

