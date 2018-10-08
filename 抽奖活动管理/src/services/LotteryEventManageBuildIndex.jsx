//#import pigeon.js
//#import Util.js
//#import search.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");//UserMgtServerObj_60008,UserMgtUserMgtServerObj_60009
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = LotteryEventManageService.get(id);
            if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;//中国人
            doc.keyword_text = jRecord.activityType + "|" + jRecord.eventName;
            doc.createTime = jRecord.createTime;
            doc.ot = "lem";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);

})();