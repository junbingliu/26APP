//#import Util.js
//#import login.js
//#import user.js
//#import favorite.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js

(function () {
    var ret = {
        code: 'E1B000011',
        msg: ""
    };
    try {
        $.log("columnId======");
        //var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        //if (!buyerId) {
        //    buyerId = LoginService.getFrontendUserId();
        //}
        var buyerId = "u_123";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
            return;
        } else {
            var type = $.params.type;
            var columnId = $.params.columnId;
            var tag = $.params.tag;
            var page = $.params.page;
            var number = $.params.number;

            if(!columnId || columnId == null){
                columnId = "";
            }
            if(!tag || tag == null){
                tag = "";
            }
            //查询用户优惠券信息List
            var cardInfo ={};
            cardInfo = FavoriteService.getMemberProductFavoriteListByPageForOle(buyerId,type,columnId,tag,page,number);
            var cardList = cardInfo.lists;
            ret.code = "S0A00000";
            ret.msg = "获取个人收藏信息成功";
            ret.data = cardList;
            out.print(JSON.stringify(ret));

        }
    } catch (e) {
        ret.code = "E1B000012";
        ret.msg = "获取个人收藏信息异常";
        out.print(JSON.stringify(ret));
    }

})();

