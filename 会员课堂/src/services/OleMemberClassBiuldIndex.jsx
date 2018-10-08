//#import pigeon.js
//#import Util.js
//#import search.js
//#import $oleMemberClass:services/OleMemberClassService.jsx

(function () {
    if (typeof ids === "undefined") {
        return;//do nothing
    }
    if (typeof bType === "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        if (bType === "activity") {
            var jRecord = OleMemberClassService.getActivity(id);
            if (jRecord) {
                var doc = {};
                doc.id = jRecord.id;
                doc.keyword_text = jRecord.title + "|" + jRecord.club.name;
                doc.keyword_text = getKeyword(doc.keyword_text, jRecord.shopRegion)
                doc.createTime = jRecord.createTime;
                doc.createUserId = jRecord.createUserId;
                doc.draftState = jRecord.state.draftState;
                doc.auditState = jRecord.state.auditState;
                doc.publishState = jRecord.state.publishState;
                doc.ot = "memberClassActivityObj";
                docs.push(doc);
            }
        } else if (bType === "class") {
            var jClass = OleMemberClassService.getClass(id);
            if (jClass) {
                var classDoc = {};
                classDoc.id = jClass.id;
                classDoc.activityId = jClass.activityId;
                classDoc.keyword_text = getKeyword(classDoc.keyword_text, jClass.shopRegion);
                classDoc.beginTime = jClass.beginTime;
                classDoc.ot = "memberClassObj";
                docs.push(classDoc);
            }

        }
    }
    if (docs.length === 0) {
        return;
    }
    SearchService.index(docs, ids);

})();

function getKeyword(keyword, shopRegion) {
    for (var k = 0; k < shopRegion.length; k++) {
        keyword = keyword + "|" + shopRegion[k]
    }
    return keyword;
}