//#import Util.js
//#import jobs.js
//#import eventBus.js

(function () {
    var ctx = {"orderId":"o_tryuse_60000"};
    $.log("\n\n ctx = " + ctx + "\n\n");
    EventBusService.fire("orderSignedAfter",ctx);
})();
