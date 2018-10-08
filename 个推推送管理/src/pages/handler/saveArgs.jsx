//#import pigeon.js
//#import Util.js
//#import $getui:services/GetuiArgService.jsx

(function () {
    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var mIds = $.params["mIds"];
    var isEnable = $.params["isEnable"];
    //配送应用参数
    var appId = $.params["appId"];
    var appKey = $.params["appKey"];
    var appSecret = $.params["appSecret"];
    var masterSecret = $.params["masterSecret"];
    //拣货应用参数
    var appId2 = $.params["appId2"];
    var appKey2 = $.params["appKey2"];
    var appSecret2 = $.params["appSecret2"];
    var masterSecret2 = $.params["masterSecret2"];

    var jArgs = {
        mIds: mIds && mIds.trim() || "",
        appKey: appKey && appKey.trim() || "",
        appId: appId && appId.trim() || "",
        appSecret: appSecret && appSecret.trim() || "",
        masterSecret: masterSecret && masterSecret.trim() || "",
        appKey2: appKey2 && appKey2.trim() || "",
        appId2: appId2 && appId2.trim() || "",
        appSecret2: appSecret2 && appSecret2.trim() || "",
        masterSecret2: masterSecret2 && masterSecret2.trim() || "",
        isEnable: isEnable && isEnable.trim() || "N"
    };
    GetuiArgService.saveArgs(m, jArgs);
    out.print(JSON.stringify({state: 'ok', msg: '保存成功'}));
})();