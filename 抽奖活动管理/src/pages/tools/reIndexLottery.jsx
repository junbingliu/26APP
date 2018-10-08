//#import Util.js
//#import $lotteryEventManage:services/LotteryLogService.jsx

(function () {
    var list = LotteryLogService.getAllList(0, -1);
    for (var i = 0; i < list.length; i++) {
        LotteryLogService.buildIndex(list[i].id);
    }
    out.print("size:" + list.length);
})();