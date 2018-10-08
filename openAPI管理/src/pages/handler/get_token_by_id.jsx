//#import pigeon.js
//#import Util.js
//#import login.js
//#import DateUtil.js
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
    var result = OpenAPIUtil.getApiToken(id);
    if (result && result.code == "S0A00000") {
        ret.state = "ok";
        ret.data = result.data;
        ret.data.beginTime = DateUtil.getShortDate(ret.data.beginTime);
        ret.data.endTime = DateUtil.getShortDate(ret.data.endTime - 10000);
    } else {
        ret.msg = result && result.msg || "读取API失败";
    }
    out.print(JSON.stringify(ret));
})();