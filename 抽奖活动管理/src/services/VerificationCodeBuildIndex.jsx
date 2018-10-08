//#import pigeon.js
//#import Util.js
//#import search.js
//#import $lotteryEventManage:services/VerificationCodeService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = VerificationCodeService.get(id);
            if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;
            doc.keyword_text = jRecord.activityGrade + "|" + jRecord.eventName;
            //2222
            doc.userId = jRecord.userId;
            doc.ot = "verificationCode";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);
})();