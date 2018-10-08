//#import Util.js
//#import user.js
//#import login.js
//#import card.js
//#import file.js
//#import DateUtil.js
//#import cardBatch.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
;(function () {
    var selfApi = new JavaImporter(
        net.xinshi.isone.open.card.CardSearch
    );
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }
    try{
        //var ret =  ErrorCode.S0A00000;
        var userId = $.params["loginUserId"] || "u_4180008";
        if(!userId){
            userId = LoginService.getFrontendUserId();
        }
        var start = Number($.params["start"]) || 1;
        var limit = Number($.params["limit"]) || 10;
        if (!userId) {
            ret = ErrorCode.article.E1B04009;//当前用户没登录
            out.print(JSON.stringify(ret));
            return
        }
       var result =  selfApi.CardSearch.getCanuserCard(userId,start,limit);
        $.log("result==============="+result)
       setResultInfo("S0A00000", "success",JSON.parse(result));
    }catch (e){
        $.error("查询优惠卷信息失败" + e);
        setResultInfo("E1B0001333","查询优惠卷信息失败" + e);
    }

})();