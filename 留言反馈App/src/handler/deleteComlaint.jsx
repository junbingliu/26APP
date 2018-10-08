//#import Util.js
//#import login.js
//#import user.js
//#import $oleComplaintApp:services/OleComplainService.jsx
//#import @handler/H5CommonUtil.jsx
(function () {
    var ret = {code: "S0A00000", msg: "操作成功"};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            ret.code = 'E1M000003';
            ret.msg = '请先登录';
            out.print(JSON.stringify(ret));
            return;
        }
        var id = $.params.id;
        if (!id || id === "") {
            ret.code = "E1M000000";
            ret.msg = "参数错误";
            out.print(JSON.stringify(ret));
            return;
        }
        OleComplainService.delComplaint(id);
        out.print(JSON.stringify(ret));
    } catch (e) {
        ret.code = "E1M000002";
        ret.msg = "系统异常";
        out.print(JSON.stringify(ret));
    }


})();