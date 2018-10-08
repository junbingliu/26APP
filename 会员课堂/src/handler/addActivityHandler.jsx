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
        data.state = {};
        data.state.draftState = "0";//草稿状态
        data.state.auditState = "0";//审核状态
        data.state.publishState = "0";
        data.state.applyState = "0";
        data.state.pushState = "0";
        data.state.classProgress = "0";
        data.state.reviewState = "0";
        data.shopRegion = [];
        var id = OleMemberClassService.addActivity(data, userId);
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