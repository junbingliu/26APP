//#import Util.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import file.js
//#import sysArgument.js

(function () {
   try {
        var imgData = $.params.imgData;
        var name =$.params.name;
        var data={};
        var result = {};
        // var loginUserId = LoginService.getFrontendUserId();
        // if (!loginUserId) {
        //     result.status = 404;
        //     result.msg = "您还未登录, 清先登录";
        //     out.print(JSON.stringify(result));
        //     return;
        // }
        if (imgData) {
            imgData = JSON.parse(imgData);
            var pos = imgData.indexOf("base64,");
            imgData = imgData.substring(pos + "base64,".length);
            var fileInfo = FileService.addFileByBytes(imgData, name);
            if (fileInfo && fileInfo.fileId) {
                var imgUrl = FileService.getFullPath(fileInfo.fileId);
                data = {
                    msg:"上传图片成功",
                    fileId: fileInfo.fileId,
                    imgUrl:imgUrl
                }
            }
        }
        
       result.data=data;
       out.print(JSON.stringify(result));

    } catch (e) {
        result.status = 500;
        result.msg = e;
        out.print(JSON.stringify(result));
        return;
    }
})();