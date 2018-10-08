//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/ClubService.jsx

(function () {

    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.status = 404;
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }

        var clubId = $.params.id;
        var status = $.params.status;
        if (!clubId || !status) {
            result.status = 102;
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }

        var obj = ClubService.getClub(clubId);
        obj.status = status;
        ClubService.updateClub(obj);

        result.status = 200;
        out.print(JSON.stringify(result));
    }catch (e) {
        result.status = 500;
        result.msg = e;
        out.print(JSON.stringify(result));
    }


})();

