//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/ClubService.jsx

(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.code = "101";
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }

        var json = $.params.json;
        if (!json) {
            result.code = "102";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        var posList = JSON.parse(json);
        if (posList.length == 0) {
            result.code = "103";
            result.msg = "没有要修改的数据";
            out.print(JSON.stringify(result));
            return;
        }
        for (var i = 0; i < posList.length; i++) {
            var jPos = posList[i];

            var clubId = jPos.id;
            var pos = jPos.pos || 100;

            ClubService.updatePos(clubId, pos);
        }


        result.code = "0";
        result.msg = "操作成功";
        out.print(JSON.stringify(result));

    } catch (e) {
        $.log("\n............................e=" + e);
        result.code = "99";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }

})();



