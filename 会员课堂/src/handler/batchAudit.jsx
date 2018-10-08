//#import Util.js
//#import login.js
//#import $oleMemberClass:services/OleMemberClassService.jsx
(function () {
    var ret = {state: "error", msg: "错误 "};
    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        ret.msg = "请先登录";
        out.print(JSON.stringify(ret));
        return;
    }
    var ids = $.params.ids;
    var toState = $.params.toState;
    if (!toState || !checkStateStr(toState)) {
        ret.msg = "非法参数";
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        ids = JSON.parse(ids);
        for (var i = 0; i < ids.length; i++) {
            $.log("===========2==========="+ids[i]);
            if (!ids[i] || ids[i] === "") {
                ret.msg = "id错误";
                out.print(JSON.stringify(ret))
                return;
            }
            var activityObj = OleMemberClassService.getActivity(ids[i]);
            activityObj.state.auditState = toState;
            OleMemberClassService.updateActivity(activityObj);
        }

        ret.state = "ok";
        ret.msg = "更新成功";
        out.print(JSON.stringify(ret))
    } catch (e) {
        out.print(e);
    }

})();

function checkStateStr(val) {
    if (val === "0") {
        return true;
    }
    else if (val === "1") {
        return true
    }
    else if (val === "-1") {
        return true;
    }
    return false;

}

