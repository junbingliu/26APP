//#import Util.js
//#import login.js
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {

    var result = {};
    try {
        var id = $.params["id"];
        var jRecord = ActivitiesHenService.get(id);

        if(!jRecord){
            //todo:
            return;
        }
        var title = $.params["title"];

        jRecord.title = title;
        ActivitiesHenService.update(jRecord);
        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

