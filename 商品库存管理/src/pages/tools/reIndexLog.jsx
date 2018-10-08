//#import Util.js
//#import $inventoryManage:services/InventoryManageService.jsx

(function () {
    var id = $.params['id'];
    if (id) {
        InventoryManageService.buildIndex(id);
        out.print("id:" + id);
    } else {
        var logList = InventoryManageService.list(0, -1);
        for (var i = 0; i < logList.length; i++) {
            var jLog = logList[i];
            if (!jLog || jLog == "null") {
                continue;
            }
            InventoryManageService.buildIndex(jLog.id);
        }
        out.print("size:" + logList.length);
    }
})();