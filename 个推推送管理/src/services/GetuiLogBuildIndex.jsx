//#import pigeon.js
//#import Util.js
//#import search.js
//#import $getui:services/GetuiService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jLog = GetuiService.getLog(id);
        if (jLog) {
            var doc = {};
            doc.id = jLog.id;
            doc.merchantId = jLog.merchantId;
            doc.type = jLog.type;
            doc.isSuccess = jLog.isSuccess;
            doc.respone_code = jLog.respone_code;
            doc.objId = jLog.objId || "";
            doc.keyword_text = jLog.content;
            doc.createTime = jLog.createTime;
            doc.ot = "getui_log";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        //return;
    }
    SearchService.index(docs, ids);

})();