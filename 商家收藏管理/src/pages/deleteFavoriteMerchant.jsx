//#import Util.js
//#import $favoriteMerchant:services/FavoriteMerchantService.jsx

(function () {
    var result = {};
    try {
        var id = $.params["id"];
        if (!id || id == "") {
            result.code = "101";
            result.msg = "参数错误";
            out.print(JSON.stringify(result));
            return;
        }
        FavoriteMerchantService.deleteFavorite(id);

        result.code = "0";
        result.msg = "删除成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
