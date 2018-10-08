//#import Util.js
//#import login.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx

(function () {
    var userId = LoginService.getBackEndLoginUserId();

    var merchantId = $.params["merchantId"];
    var id = $.params["id"];
    var name = $.params["name"];
    var isEnable = $.params["isEnable"];
    var reason = $.params["reason"];
    var desc = $.params["desc"];
    var batchIds = $.params["batchIds"];
    var count = $.params["count"];
    var amount = $.params["amount"];
    var beginTime = $.params["beginTime"];
    var endTime = $.params["endTime"];
    var ret = {};
    try {
        var jTempAct = {};
        jTempAct.merchantId = merchantId;
        jTempAct.id = id;
        jTempAct.name = name;
        jTempAct.isEnable = isEnable;
        jTempAct.reason = reason;
        jTempAct.desc = desc;
        jTempAct.batchIds = batchIds;
        jTempAct.count = count;
        jTempAct.amount = amount;
        jTempAct.beginTime = beginTime;
        jTempAct.endTime = endTime;

        if (!id || id.trim() == "") {
            FreeGetCardService.addActivity(userId, jTempAct);
        } else {
            var jActivity = FreeGetCardService.getActivity(id);
            if(!jActivity){
                ret.state = "ok";
                ret.msg = "领券活动不存在";
                out.print(JSON.stringify(ret));
                return;
            }

            jActivity.name = jTempAct.name;
            jActivity.isEnable = jTempAct.isEnable;
            jActivity.reason = jTempAct.reason;
            jActivity.desc = jTempAct.desc;
            jActivity.batchIds = jTempAct.batchIds;
            jActivity.count = jTempAct.count;
            jActivity.amount = jTempAct.amount;
            jActivity.beginTime = jTempAct.beginTime;
            jActivity.endTime = jTempAct.endTime;
            FreeGetCardService.saveActivity(jActivity);
        }

        ret.state = "ok";
    } catch (e) {
        ret.state = "error";
        ret.msg = "操作出现异常，请稍后再试";
    }
    out.print(JSON.stringify(ret));
})();