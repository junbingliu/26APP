//#import Util.js
//#import $shell20:service/service.jsx
//#import login.js

var userId = LoginService.getBackEndLoginUserId();
var w = $.params.w;
var h = $.params.h;
Shell20Service.removeWorkSpace(userId,w,h);
var ret = {
    state:"ok"
}
out.print(JSON.stringify(ret));

