//#import Util.js
//#import login.js
//#import user.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js

(function () {
    var ret = {
        code: 'E1B130013',
        msg: ""
    };
    try {
        var shopimageurl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "shop_allimage");
        ret.code = "S0A00000";
        ret.msg = "查询门店实景URL成功";
        ret.data = shopimageurl;
        out.print(JSON.stringify(ret));
    } catch (e) {
        ret.msg = "查询门店实景URL失败";
        ret.code = "E1B130014";
        out.print(JSON.stringify(ret));
    }

})();

