//#import pigeon.js
//#import Util.js
//#import search.js
//#import $oleComplaintApp:services/OleComplainService.jsx

(function () {
    if (typeof ids === "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = OleComplainService.getComplaint(id);
        if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;
            doc.keyword_text = jRecord.name+"|"+jRecord.shopName+"|"+jRecord.mobile;
            doc.createTime = jRecord.createTime;
            doc.handleState = jRecord.handleState;
            doc.createUserId = jRecord.createUserId;
            doc.relevanceMid = jRecord.relevanceMid;
            doc.ot = "oleComplainObject";
            docs.push(doc);
        }
    }
    if (docs.length === 0) {
        return;
    }
    SearchService.index(docs, ids);

})();