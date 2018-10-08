//#import pigeon.js
//#import Util.js
//#import search.js
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = PrizeSettingSomService.get(id);
        if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;//中国人
            doc.keyword_text = jRecord.activityTypeId + "|" + jRecord.activityTypeName;
            doc.createTime = jRecord.createTime;
            doc.ot = "prize";
            docs.push(doc);

        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);

})();