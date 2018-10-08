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
        if (jNew) {
            var doc = {};
            doc.id = jNew.id;
            doc.operation = jNew.operation;
            doc.project = jNew.project;
            doc.backEndLoginId = jNew.backEndLoginId;
            doc.merchantId = jNew.merchantId;
            doc.referenceId = jNew.referenceId;
            // doc.pushManagementId = jNew.pushManagementId;
            doc.operationTime = jNew.operationTime;
            doc.referenceCreateTime = jNew.referenceCreateTime;
            doc.remark = jNew.remark;
            doc.ot = "SystemRecordsManagement";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);
})();
// 该条数据结构：
// var jNew = {<<=====jNew;
//     old_data: old_data,//保存旧的推送管理数据
//     new_data: new_data,//保存新的推送管理数据
//     backEndLoginId: modifier,//后台登陆者ID【检索】
//     id: systemRecordId,//该条推送管理日志ID【检索】
//     pushManagementId: id,//该条推送管理ID【检索】
//     operationTime: modifyTime,//推送管理日志生成时间【检索】
//     pushManagementCreateTime: old_jNew.createTime//推送管理服务的创建时间【检索】
// }