//#import Util.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {
    var res = CommonUtil.initRes();
    try {
        var imgData = $.params.imgData;
        var name = $.params.name;
        var data = {};
        var loginUserId = LoginService.getFrontendUserId();
        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M000003);
            return;
        }
        if (imgData) {
            if (!name) {
                name = "1." + imgData.substring(imgData.indexOf("data:image/") + "data:image/".length, imgData.indexOf("base64") - 1);
            }
            imgData = JSON.parse(imgData);
            var pos = imgData.indexOf("base64,");
            imgData = imgData.substring(pos + "base64,".length);
            var fileInfo = FileService.addFileByBytes(imgData, name);
            if (fileInfo && fileInfo.fileId) {
                var imgUrl = FileService.getFullPath(fileInfo.fileId);
                data = {
                    msg: "上传图片成功",
                    fileId: fileInfo.fileId,
                    imgUrl: imgUrl
                }
            }
        }
        CommonUtil.setRetData(res, data);
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.E1M000002, e + "");
        return;
    }
})();