//#import Util.js
//#import session.js

var buyerId = $.params.buyerId;
SessionService.addSessionValue("backBuyerId",buyerId,request,response);
var ret ={
    state:"ok"
}
out.print(JSON.stringify(ret));
