//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import sysArgument.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx
//#import $freeGetCardControl:services/FreeGetCpsCardUtil.jsx

/**
 * 查询电子价签商品详情以及赠送优惠券信息
 * @author
 * @email
 * @date 2017-07-31
 */
(function () {
    var ret = {
        code: 'E1B200005',
        msg: ""
    };
    try {
        var jUser = LoginService.getFrontendUser();
        if (!jUser) {
            ret.code = "E1B200002";
            ret.msg = "请先登录";
            out.print(JSON.stringify(ret));
            return;
        }
        var buyerId = jUser.id;//u_4110001
        //var buyerId = "u_50000";//u_4110001
        var errMsg = "领取优惠券失败";
        var returnObj = {};
        var jResult = {};
        var resultArr = [];
        var resultBool = true;
        var errnum = 0;
        var cardBatchIds = $.params.cardBatchIds;
        var electricActivityIds = $.params.electricActivityIds;
        var cardBatchIdArr = cardBatchIds.split(",");
        var electricActivityArr = electricActivityIds.split(",");

        if(electricActivityArr.length != 0 && cardBatchIdArr.length != 0 && electricActivityArr.length != cardBatchIdArr.length){
            ret.code = "E1B200006";
            ret.msg = "活动个数和券批次个数不匹配!";
            out.print(JSON.stringify(ret));
            return;
        }
        var elelen = electricActivityArr.length;
        for(var i=0;i<elelen;i++){
            var actId = electricActivityArr[i];
            var batchId = cardBatchIdArr[i];
            jResult = FreeGetCardUtil.doGiveCard(buyerId, actId, batchId);
            var codestr = jResult.code;
            if("0" != codestr){
                resultBool = false;
                errnum++;
                errMsg = jResult.msg;
            }
            resultArr.push(jResult);
        }
        if(errnum == 0){
            returnObj.data = resultArr;
            ret.code = "S0A00000";
            ret.msg = "领取优惠券成功";
            ret.data = returnObj;
            out.print(JSON.stringify(ret));
        }else if(errnum>0 && errnum<elelen){
            returnObj.data = resultArr;
            ret.code = "S0A00000";
            ret.msg = "领取优惠券成功";
            ret.data = returnObj;
            out.print(JSON.stringify(ret));
        }else{
            returnObj.data = resultArr;
            ret.code = "E1B200008";
            ret.msg = errMsg;
            ret.data = returnObj;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.code = "E1B200008";
        ret.msg = "领取优惠券异常";
        out.print(JSON.stringify(ret));
    }
})();

