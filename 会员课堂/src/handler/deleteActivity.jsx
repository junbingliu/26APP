//#import Util.js
//#import login.js
//#import user.js
//#import $oleMemberClass:services/OleMemberClassService.jsx

(function () {
    var ret = {state: "S0A00000", msg: "操作成功"};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            ret.code = 'E1M000003';
            ret.msg = '请先登录';
            out.print(JSON.stringify(ret));
            return;
        }
        var ids = $.params.ids;
        ids = JSON.parse(ids);
        for (var i = 0; i < ids.length; i++) {
            if (!ids[i] || ids[i] === "") {
                ret.code = "E1M000000";
                ret.msg = "参数错误";
                out.print(JSON.stringify(ret));
                return;
            }
            OleMemberClassService.delActivity(ids[i]);
        }
        out.print(JSON.stringify(ret));
    } catch (e) {
        ret.code = "E1M000002";
        ret.msg = "系统异常";
        out.print(JSON.stringify(ret));
    }


})();