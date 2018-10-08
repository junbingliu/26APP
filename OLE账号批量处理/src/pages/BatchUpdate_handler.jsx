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
            out.print("数据包文件上传失败或者获取失败");
            return;
        }

        var postData = {merchantId: merchantId, userId:userId, filePath: filePath};
        postData.findType = jParameters.findType || "";
        postData.findOriUserIdIndex = jParameters.findOriUserIdIndex || "";
        postData.findTargetUserIdIndex = jParameters.findTargetUserIdIndex || "";
        postData.findMergeTypeIndex = jParameters.findMergeTypeIndex || "";
        postData.doIfDuplicateExist = jParameters.doIfDuplicateExist || "0";
        postData.beginLine = jParameters.dataBeginLine || "";
        postData.endLine = jParameters.dataEndLine || "";
        var when = (new Date()).getTime();
        var jobPageId = "tasks/BatchUpdateTask.jsx";
        JobsService.submitTask(appId, jobPageId, postData, when);
    }
    catch (e) {
        var msg = "操作出现异常：" + e;
        out.print(msg);
    }
})();