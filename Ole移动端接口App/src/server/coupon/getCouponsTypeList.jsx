//#import Util.js
//#import login.js
//#import user.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import card.js

(function () {
    var ret = {
        code: 'E1B130005',
        msg: ""
    };
    try {
        var couponstype = "9719000216113";//券id字符串
        var paramobj = {
            couponstype:couponstype
        }
        var memberobj = UserService.getCouponsTypeList(paramobj);
        var status = memberobj.status;
        if(status == "0"){
            ret.code = "S0A00000";
            ret.msg = "查询券类型信息成功";
            ret.data = memberobj.data;
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B130011";
            ret.msg = memberobj.msg;
            out.print(JSON.stringify(ret));
            return;
        }
    } catch (e) {
        ret.msg = "查询券类型信息失败";
        ret.code = "E1B130012";
        out.print(JSON.stringify(ret));
    }

})();

