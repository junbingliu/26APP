//#import pigeon.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import Util.js
//#import search.js

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jLog = OmsEsbLogService.getLog(id);
        if (jLog) {
            var doc = {};
            doc.id = jLog.id;
            doc.type = jLog.type;
            doc.objId = jLog.objId || "";
            doc.keyword_text = jLog.serviceId + "|" + jLog.serialNumber + "|" + jLog.objId;
            doc.serviceId = jLog.serviceId;
            doc.serialNumber = jLog.serialNumber;
            doc.createTime = jLog.createTime;
            doc.ot = "omsLog";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);

})();