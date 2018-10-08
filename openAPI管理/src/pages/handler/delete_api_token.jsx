//#import pigeon.js
//#import Util.js
//#import login.js
//#import $openAPIManage:services/OpenAPIUtil.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var id = $.params["id"];
    if(!id){
        ret.msg = "Id不能为空";
        out.print(JSON.stringify(ret));
        return;
    }
    var result = OpenAPIUtil.deleteApiToken(id);
    if (result && result.code == "S0A00000") {
        ret.state = "ok";
        ret.data = result.data;
    } else {
        ret.msg = result && result.msg || "删除失败";
    }
    out.print(JSON.stringify(ret));
})();