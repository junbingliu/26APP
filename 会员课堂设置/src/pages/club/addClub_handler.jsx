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

        var id = $.params.id;
        var name = $.params.name;
        var storyContent = $.params.storyContent;
        var entranceImg = $.params.entranceImg;
        var storyBackgroudImg = $.params.storyBackgroudImg;
        var status = $.params.status;

        if (!id) {

            var data = {};
            data.pos = 100;
            data.name = name;
            data.storyContent = storyContent;
            data.entranceImg = entranceImg;
            data.storyBackgroudImg = storyBackgroudImg;
            data.status = !status ? 0 : 1;

            ClubService.addClub(data);
        } else {
            var obj = ClubService.getClub(id);
            obj.name = name;
            obj.storyContent = storyContent;
            obj.entranceImg = entranceImg;
            obj.storyBackgroudImg = storyBackgroudImg;
            ClubService.updateClub(obj);
        }
        result.code = "0";
        out.print(JSON.stringify(result));

    } catch (e) {
        $.log("\n............................e="+e);
        result.code = "99";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }

})();



