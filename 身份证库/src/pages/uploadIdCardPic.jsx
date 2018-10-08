//#import Util.js
//#import login.js
//#import file.js
//#import user.js

;(function () {
    var result = {};
    var dataType = "json";
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "101";
            result.msg = "请先登录";
            return;
        }

        dataType = $.params.dataType;
        var jFileInfos = $.uploadFiles("jpg,gif", 1024 * 50);
        if (!jFileInfos) {
            result.code = "102";
            result.msg = "没有可上传的文件";
            return;
        }

        var jFileInfo = jFileInfos[0];
        var fieldName = jFileInfo.fieldName;
        var fileId = jFileInfo.fileId;
        var jParameters = jFileInfo["parameters"];
        var picType = jParameters.picType;
        var spex = jParameters.spex || "144X90";
        if(!fileId || fileId == ""){
            result.code = "103";
            result.msg = "没有可上传的文件，错误码为103";
            return;
        }

        if(!picType || picType == ""){
            result.code = "104";
            result.msg = "picType为空";
            return;
        }

        var fullPath = FileService.getFullPath(fileId);
        var relPtah = FileService.getRelatedUrl(fileId, spex);

        result.code = "0";
        result.picType = picType;
        result.fileId = fileId;
        result.fullPath = fullPath;
        result.relPtah = relPtah;
        result.msg = "上传成功";
    }
    catch (e) {
        var ee = e + "";
        result.code = "99";
        result.msg = "操作出现异常：" + e;
        if (ee.indexOf("File is too large") > -1 || ee.indexOf("文件大小超出了最大限制") > -1) {
            result.msg = "File is too large";
        } else if (ee.indexOf("fileType is not allowed") > -1 || ee.indexOf("文件类型不允许上传") > -1) {
            result.msg = "fileType is not allowed";
        }
    } finally {
        var data = JSON.stringify(result);
        if(dataType == "json"){
            out.print(data);
        } else {
            out.print("<script>parent.uploadIdCardPicCallback('" + data + "')</script>");
        }
    }
})();