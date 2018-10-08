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
    var data = $.params.data;
    try {
        data = JSON.parse(data);
        if (!isNull(data)) {
            return;
        }
        var activityId = data.activityId;
        if (!activityId || activityId === "") {
            ret.msg = "id不能为空";
            out.print(JSON.stringify(ret));
            return;
        }
        var id = OleMemberClassService.addClass(data, userId);
        var activity = OleMemberClassService.getActivity(activityId);
        activity.shopRegion = data.shopRegion;
        OleMemberClassService.updateActivity(activity);
        ret.state = "ok";
        ret.id = id;
        ret.msg = "添加成功";
        out.print(JSON.stringify(ret))
    } catch (e) {
        out.print(e);
    }

})();

function isNull(data) {
    for (var i in data) {
        if (!data[i] || data[i] === "") {
            return false;
        }
    }
    return true;
}