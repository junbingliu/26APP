//#import search.js
//#import $oleMobileApi:services/ArrivalRemindService.jsx

/**
 * 到货订阅数据索引
 * @author fuxiao9
 * @date 2017-07-12
 * @email fuxiao9@crv.com.cn
 */
;(function () {
    // id, deleteState 变量由提交job的函数传值过来
    var objId = id;
    var objDeleteState = deleteState;

    $.log("\n\n ArrivalRemindIndexJob begin: \n\n");
    if (!objId) {
        $.log("\n\n ArrivalRemindIndexJob id is null\n\n");
        return;
    }
    $.log("\n\n ArrivalRemindIndexJob id =: " + objId + "\n\n");
    $.log("\n\n ArrivalRemindIndexJob objDeleteState = " + objDeleteState + "\n\n");

    var doc = {};
    if (objDeleteState === "false") {
        var arrivalRemindObj = ArrivalRemindService.getObject(id);
        if (arrivalRemindObj) {
            $.log("\n\n ArrivalRemindIndexJob info =: " + JSON.stringify(arrivalRemindObj) + "\n\n");
            if (arrivalRemindObj.userId) {
                doc.userId = arrivalRemindObj.userId;
            }
            if (arrivalRemindObj.email) {
                doc.email = arrivalRemindObj.email;
            }
            if (arrivalRemindObj.telephone) {
                doc.telephone = arrivalRemindObj.telephone;
            }
            if (arrivalRemindObj.productId) {
                doc.productId = arrivalRemindObj.productId;
            }
            if (arrivalRemindObj.skuId) {
                doc.skuId = arrivalRemindObj.skuId;
            }
            if (arrivalRemindObj.createTime) {
                doc.createTime = arrivalRemindObj.createTime;
            }
            $.copy(doc, arrivalRemindObj.extended);
            doc.id = arrivalRemindObj.id;
            doc.ot = "ArrivalRemindIndex";
            doc.deleteState = "false";
            $.log("\n\n ArrivalRemindIndex doc info = " + JSON.stringify(doc) + "\n\n");
        }
    } else {
        $.log("\n\n ArrivalRemindIndexJob delete index  ");
        doc.deleteState = "true";
    }
    SearchService.index([doc], [id]);
})();
