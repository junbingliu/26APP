//#import Util.js
//#import Info.js
//#import column.js
//#import file.js
//#import jobs.js
//#import login.js

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

        var postData = {merchantId: merchantId, userId:userId, filePath: filePath};
        postData.objIdIndex = jParameters.objId || "";
        postData.firstChannelIndex = jParameters.firstChannel || "";
        postData.channelIndex = jParameters.channel || "";
        postData.publishStateIndex = jParameters.publishState || "";

        //保存覆盖架状态
        postData.radioStateValue = jParameters.radioStateValue;

        postData.dataBeginLine = jParameters.dataBeginLine || "";
        postData.dataEndLine = jParameters.dataEndLine || "";
        $.log(JSON.stringify(postData)+"postJSON-------");
        var when = (new Date()).getTime();
        var jobPageId = "tasks/infoUpdateTask.jsx";
        JobsService.submitTask(appId, jobPageId, postData, when);
        out.print("操作成功");
    }
    catch (e) {
        $.log("......................error=" + e);
        var msg = "操作出现异常：" + e;
        out.print(msg);
    }


})();

