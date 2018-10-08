//#import login.js
//#import Util.js
//#import CULCard.js
//#import card.js
//#import @jsLib/GenToken.jsx

(function () {

    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.org.apache.commons.lang,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.base.ext,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.account,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.functions.card,
        Packages.net.xinshi.isone.functions.sysargument,
        Packages.java.util,
        Packages.java.lang
    );


    var cardNo = $.params["cardNo"];
    var cardPwd = $.params["cardPwd"];

    var result = {};
    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        result.state = '10';
        result.msg = '请登录';
        out.print(JSON.stringify(result));
        return;
    }

    var paramToken = $.params.token;
    if(!paramToken){
        result.state = "token_empty";
        out.print(JSON.stringify(result));
        return;
    }
    var token = GenToken.get("couponToken");
    if(!token) {
        result.state = "token_null";
        out.print(JSON.stringify(result));
        return;
    }else if(paramToken != token){
        result.state = "token_error";
        out.print(JSON.stringify(result));
        return;
    }

    if (!cardNo) {
        result.state = '1';
        result.msg = '请输入兑换码';
        out.print(JSON.stringify(result));
        return;
    }
    if (!cardPwd) {
        result.state = '2';
        result.msg = '请输入密码！';
        out.print(JSON.stringify(result));
        return;
    }

    try {
        var innerTypeId = "cardType_coupons";
        var card = CardService.getCardByNumber(innerTypeId,cardNo);
        if(!card){
            result.state = '5';
            result.msg = '抱歉，此优惠券不存在，请检查您输入的兑换码！';
            out.print(JSON.stringify(result));
            return;
        }

        var cardBatchId = card.cardBatchId;
        //var jRechargeBatchIds = selfApi.SysArgumentFunction.getSysArgument("head_merchant", "col_sysargument", "bd_predepositRecharge");
        //if (jRechargeBatchIds != null && selfApi.StringUtils.isNotBlank(jRechargeBatchIds.optString("value"))) {
        //    var initIdsList = new selfApi.ArrayList();
        //    var initIds = selfApi.StringUtils.split(jRechargeBatchIds.optString("value"), ",");
        //    for(var i=0;i<initIds.length;i++){
        //        initIdsList.add(initIds[i]);
        //    }
        //
        //    if (initIdsList.contains(cardBatchId)) {
        //        result.state = '6';
        //        result.msg = '这是提货券！';
        //        out.print(JSON.stringify(result));
        //        return;
        //    }
        //}

        if(cardPwd.length < 8){
            var length = 8 - cardPwd.length;
            var str = "";
            for(var i=0;i<length;i++){
                str += "0";
            }
            cardPwd = str + cardPwd;
        }


        var cardsMap = new selfApi.ConcurrentHashMapExt();
        cardsMap.put(cardNo, cardPwd);
        var status = selfApi.CardFunction.bindCards2User(userId, innerTypeId, cardsMap);
        if (status == "0") {
            //addBalanceToAccount(card, userId);

            result.msg = "";
        }else if(status == "4"){
            result.msg = "此购物券已激活或已使用";
        }

        result.state = status + "";
        out.print(JSON.stringify(result));
    } catch (e) {
        result.state = 'error';
        result.msg = "绑定优惠券出现异常：" ;
        out.print(JSON.stringify(result));
        $.log(e)
    }



    function addBalanceToAccount(card, userId) {

        var jCard = $.toJavaJSONObject(card)
        var cardId = card.id;
        var isOk = selfApi.CardFunction.addAmountToAccount(jCard, userId, selfApi.IAccountService.ACCOUNT_TYPE_EWALLET);
        if (isOk) {
            jCard.put("canceled", "1");//已作废，即已使用
            jCard.put("saleStatus", "1");  //已出售
            jCard.put("remainAmount", "0");
            jCard.put("modifyTime", new Date().getTime() + "");
            selfApi.IsoneModulesEngine.cardService.updateCard(jCard);

            var jCardOperaLog = new selfApi.JSONObject();
            jCardOperaLog.put("operateType", "激活/绑定");
            jCardOperaLog.put("operateContent", "会员激活卡充值，卡号为:" + jCard.optString("cardNumber"));
            jCardOperaLog.put("operateUser", "系统");
            jCardOperaLog.put("operateTime", new Date().getTime() + "");
            selfApi.IsoneModulesEngine.cardService.addOperateLogs(jCardOperaLog, cardId);
        }

    }




})();

