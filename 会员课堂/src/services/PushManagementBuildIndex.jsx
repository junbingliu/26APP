//#import Util.js
//#import search.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jNew = PushManagementService.getNew(id);
        // $.log("\n\n\n==重建索引=>\n\n\n" + jNew.id);
        // $.log(jNew.id)
        if (jNew) {
            var doc = {};
            doc.id = jNew.id;
            doc.pushTarget_value = jNew.pushTarget_value;
            doc.toTriggerState_value = jNew.toTriggerState_value;
            doc.pushServer_value = jNew.pushServer_value;
            doc.pushContentSetUp_value = jNew.pushContentSetUp_value;
            doc.pushStatement_value = jNew.pushStatement_value;
            doc.pushContent_value = jNew.pushContent_value;
            // doc.delete = jNew.delete || "F";
            doc.keyword_text = jNew.pushContent_value;
            doc.ot = "PushManagementService";
            docs.push(doc);
        }
    }
    // if (docs.length == 0) {
    //     return;
    // }
    SearchService.index(docs, ids);
})();