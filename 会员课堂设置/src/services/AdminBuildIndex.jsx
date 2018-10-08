//#import pigeon.js
//#import Util.js
//#import user.js
//#import search.js
//#import $oleMemberClassSetting:services/AdminService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }

    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var jRecord = AdminService.getAdmin(id);
        if (jRecord) {

            var userId = jRecord.userId;
            var jUser = UserService.getUser(userId);
            if (!jUser) {
                continue;
            }

            var doc = {};
            doc.id = jRecord.id;
            doc.userId = jRecord.userId;
            doc.merchantId = jRecord.merchantId;
            doc.adminType = jRecord.adminType;
            doc.keyword_text = jRecord.userId + "|" + jUser.realName + "|" + jUser.mobilPhone;
            doc.createTime = jRecord.createTime;
            doc.createUserId = jRecord.createUserId;
            doc.ot = "oleMemberClassSetting_admin";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);

})();