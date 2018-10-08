//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import login.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
(function () {
    var result = {
        state: 'err',
        msg: ''
    };
    var mid = $.params["mid"];
    var shipNode = $.params["shipNode"];
    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        result.msg = "请登录后再操作";
        out.print(JSON.stringify(result));
        return;
    }
    if(!shipNode){
        result.msg = "商家ID为空";
        out.print(JSON.stringify(result));
        return;
    }
    result.state = "ok";
    OmsControlArgService.saveShipNode(mid, shipNode);
    out.print(JSON.stringify(result));
})();

