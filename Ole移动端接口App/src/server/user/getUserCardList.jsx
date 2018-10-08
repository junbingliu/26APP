//#import Util.js
//#import login.js
//#import user.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import card.js

(function () {
    var ret = {
        code: 'E1B000009',
        msg: ""
    };
    try {
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
            var accountType = $.params.accountType;
            var str_start = $.params.str_start;
            var str_limit = $.params.str_limit;
            //查询用户优惠券信息List
            var cardInfo ={};
            if("all" == accountType){
                cardInfo = CardService.getUserAbleUseCard(buyerId,"cardType_coupons",str_start,str_limit);
            }else if("used" == accountType){
                cardInfo = CardService.getUserHasUsedCard(buyerId,"cardType_coupons",str_start,str_limit);
            }else if("expired" == accountType){
                cardInfo = CardService.getUserExpiredCard(buyerId,"cardType_coupons",str_start,str_limit);
            }
            var cardList = cardInfo.lists;
            ret.code = "S0A00000";
            ret.msg = "获取个人优惠券信息成功";
            ret.data = cardList;
            out.print(JSON.stringify(ret));

        }
    } catch (e) {
        ret.code = "E1B000010";
        ret.msg = "获取个人优惠券信息异常";
        out.print(JSON.stringify(ret));
    }

})();

