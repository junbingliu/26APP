//#import Util.js
//#import login.js
//#import user.js
//#import $freeGetCardSetting:services/FreeGetCardSettingService.jsx

;(function () {
    var result = {};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "101";
            result.msg = "请先登录";
            return;
        }

        var id = $.params.id;


        if (!id || id == "") {
            result.code = "103";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        var jGetCardRecord = FreeGetCardSettingService.getGetCardRecord(id);
        if(!jGetCardRecord){
            result.code = "105";
            result.msg = "数据不存在";
            out.print(JSON.stringify(result));
            return;
        }
        var curTime = new Date().getTime();

        FreeGetCardSettingService.delGetCardRecord(id);

        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
