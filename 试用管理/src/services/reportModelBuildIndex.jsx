//#import pigeon.js
//#import Util.js
//#import search.js
//#import $tryOutManage:services/tryOutManageServices.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jLog = tryOutManageServices.getById(id);
        if (jLog) {
            var doc = {};
            doc.id = jLog.id;
            doc.columnIds = jLog.columnIds;
            doc.createTime = jLog.createTime;
            doc.ot = "reportModel";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        //return;
    }
    SearchService.index(docs, ids);
})();