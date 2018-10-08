//#import Util.js
//#import login.js
//#import file.js
//#import jobs.js

;
(function () {
    try {
        var userId = LoginService.getBackEndLoginUserId();

        if (!userId) {
            out.print("请先登录");
            return;
        }
        var jFileInfos = $.uploadFiles("xls,xlsx", 1024 * 1024 * 100);
        if (!jFileInfos) {
            out.print("文件上传失败");
            return;
        }
        var jFileInfo = jFileInfos[0];
        if (!jFileInfo) {
            out.print("获取文件失败");
            return;
        }
        var jParameters = jFileInfo["parameters"];
        var merchantId = jParameters.merchantId;
        if (!merchantId) {
            out.print("merchantId is null");
            return;
        }

        var fileId = jFileInfo.fileId;
        var filePath = FileService.getInternalPath(fileId);
        if(!filePath || filePath == ""){
            out.print("Excel文件上传失败或者获取失败");
            return;
        }
        var template = jParameters.template;
        if(template == "old"){

            jParameters.skuIndex = jParameters.skuIndex2;
            jParameters.priceIndex = jParameters.priceIndex2;
            jParameters.beginTimeIndex = jParameters.beginTimeIndex2;
            jParameters.endTimeIndex = jParameters.endTimeIndex2;
            jParameters.merchantIndex = "";
            jParameters.barcodeIndex = "";
            jParameters.priceNameIndex = "";
            jParameters.userGroupNameIndex = "";
        }
        var postData = {merchantId: merchantId, userId:userId, filePath: filePath};
        postData.skuIndex = jParameters.skuIndex || "";//sku编码
        postData.priceIndex = jParameters.priceIndex || "";//特价
        postData.beginTimeIndex = jParameters.beginTimeIndex || "";//特价开始时间
        postData.endTimeIndex = jParameters.endTimeIndex || "";//特价结束时间
        postData.merchantIndex = jParameters.merchantIndex || "";//所属商家
        postData.barcodeIndex = jParameters.barcodeIndex || "";//条形码
        postData.priceNameIndex = jParameters.priceNameIndex || "";//价格名称
        postData.userGroupNameIndex = jParameters.userGroupNameIndex || "";//用户组名称
        postData.beginLine = jParameters.dataBeginLine || "";
        postData.endLine = jParameters.dataEndLine || "";
        postData.execWhenDuplicateTime = jParameters.execWhenDuplicateTime || "";

        var when = (new Date()).getTime();
        var jobPageId = "tasks/BatchUpdateTask.jsx";
        JobsService.submitTask(appId, jobPageId, postData, when);
    }
    catch (e) {
        var msg = "操作出现异常：" + e;
        out.print(msg);
    }
})();