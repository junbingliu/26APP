//#import Util.js
//#import login.js
//#import favorite.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B030001',
        msg: ""
    };
    try {
        //获取登录用户信息
        //var user = LoginService.getFrontendUser();
        var user = {};
        user.id = "u_123";
        if (!user) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
            return;
        } else {
            var userId = user.id;
            var objId = $.params.objId;//收藏对象ID
            var objType = $.params.type;//收藏对象类型
            if(!objId || objId == null){
                ret.code = "E1B030002";
                ret.msg = "收藏对象ID不能为空!";
                out.print(JSON.stringify(ret));
                return;
            }
            if(!objType ||objType==null){
                ret.code = "E1B030003";
                ret.msg = "收藏对象类型不能为空!";
                out.print(JSON.stringify(ret));
                return;
            }
            var favoriteId = FavoriteService.getFavoriteId(objId, objType);
            var isExist = FavoriteService.isExistFavoriteOle(userId, objType, favoriteId);
            if(isExist){
                ret.code = "E1B030004";
                ret.msg = "对象已收藏!";
                out.print(JSON.stringify(ret));
                return;
            }
            //如果不存在，则添加至收藏
            var jFavorite = {};
            FavoriteService.addFavorite(userId, objId, objType, $.JSONObject(jFavorite));
            totalCount = FavoriteService.getFavoriteToTalCount(userId, objType);

            ret.code = "S0A030000";
            ret.msg = "文章收藏成功";
            ret.data = totalCount;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "文章收藏失败";
        out.print(JSON.stringify(ret));
    }

})();

