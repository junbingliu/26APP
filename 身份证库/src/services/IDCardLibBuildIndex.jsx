//#import pigeon.js
//#import Util.js
//#import search.js
//#import $IDCardLib:services/IDCardLibService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = IDCardLibService.getIdCard(id);
        if (jRecord) {
            var doc = {};
            doc.id = jRecord.id;
            doc.keyword_text = jRecord.name + "|" + jRecord.idCard;
            doc.state = jRecord.state;
            doc.createTime = jRecord.createTime;
            doc.createUserId = jRecord.createUserId;

            if((jRecord.newIdCardFrontPic && jRecord.newIdCardFrontPic != "") || (jRecord.newIdCardBackPic && jRecord.newIdCardBackPic != "")){
                doc.certifyState = "0";
            } else {
                doc.certifyState = "1";
            }

            doc.ot = "IDCardLib";
            docs.push(doc);
        }
    }
    if (docs.length == 0) {
        return;
    }
    SearchService.index(docs, ids);

})();