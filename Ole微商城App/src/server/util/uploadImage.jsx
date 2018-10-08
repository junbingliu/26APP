//#import Util.js
//#import pigeon.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import user.js
//#import base64.js
//#import NoticeTrigger.js
//#import DESEncryptUtil.js
(function () {
    //这个是发送短信的接口
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }

    var uploadObj = InfoscapeUtil.uploadImage(request);
    var statestr = uploadObj.state;
    if("ok" == statestr){
        var fileobj = uploadObj.files;
        setResultInfo("S0A00000","上传成功",fileobj);
    }else{
        var msg = uploadObj.msg;
        if(!msg || msg == null){
            msg = "";
        }
        setResultInfo("E1B0002",msg);
    }

    return;

})();