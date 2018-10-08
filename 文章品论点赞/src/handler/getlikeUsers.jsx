//#import Util.js
//#import DateUtil.js
//#import Info.js
//#import user.js
//#import $articleCommentLike:services/commentLikeService.jsx
(function () {
    var id = $.params["id"];
    var code = $.params["code"] || "1";
    var like = commentLikeService.getById(id);
    var data = {};

    function name1(name) {
        var checkinUserName = "";
        if (name.realName) {
            checkinUserName = name.realName;
        } else if(name.nickName){
            checkinUserName = name.nickName;
        }else{
            checkinUserName = name.loginId;
        }
        return checkinUserName;
    }
    if(code != "2"){
        if(code == "0"){
            data.logins = like.likeLogin;
        }else if(code == "1"){
            data.logins = like.logins;
        }
        for(var i =0; i < data.logins.length; i++){
            data.logins[i].createTime =  DateUtil.getLongDate(data.logins[i].createTime);
            var name = UserService.getUser(data.logins[i].loginId);
            if(name){
            data.logins[i].loginId = name1(name);
            }
        }
    }else{
        var obj = InfoService.getInfo(id);
        data.articleData = obj.content
    }

    out.print(JSON.stringify(data));
})();