//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js

;
(function () {
    var result = {};
    try {

        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            result.code = "101";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        var userId = $.params["userId"];

        var eWalletAmount = UserService.getUserEWalletMoneyAmount(userId);
        if(eWalletAmount){
            eWalletAmount =( eWalletAmount / 100).toFixed(2);
        }else{
            eWalletAmount=0;
        }

        result.code = "0";
        result.v = eWalletAmount;
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
