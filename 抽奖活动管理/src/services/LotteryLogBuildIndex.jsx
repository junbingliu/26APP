//#import pigeon.js
//#import Util.js
//#import search.js
//#import $lotteryEventManage:services/LotteryLogService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = LotteryLogService.get(id);
            if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;
            doc.keyword_text = jRecord.gradeName + "|" + jRecord.eventName;
            doc.createTime = jRecord.createTime;
            //2222
            doc.userId = jRecord.userId;
            doc.eventId = jRecord.eventId;
            doc.ot = "lotteryLog";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);
})();