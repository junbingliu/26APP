//#import Util.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js

(function () {


    var ret = {
        state:false,
        errorCode:""
    }


    var imgData= $.params.imgData;
    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        ret.errorCode="notLogin";
        out.print(JSON.stringify(ret));
        return;
    }
    if(imgData){
        imgData=JSON.parse(imgData);
        var pos = imgData.indexOf("base64,");
        imgData = imgData.substring(pos+"base64,".length);
        var fileInfo = FileService.addFileByBytes(imgData,"testOne");

        if(fileInfo&&fileInfo.fileId){
            var ImgUrl=FileService.getFullPath(fileInfo.fileId);


            ret = {
                state:"ok",
                // fileId:fileInfo.fileId,
                ImgUrl:ImgUrl
            }

        }

    }
    out.print(JSON.stringify(ret));
})();