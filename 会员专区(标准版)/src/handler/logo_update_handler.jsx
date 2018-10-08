//#import Util.js
//#import login.js
//#import user.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.org.apache.commons.lang,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.security
    );

    var ret = {
        state:false,
        errorCode:""
    }
    try{
        var contextPath = request.getContextPath();

        var userId = "";

        var loginKey = $.params.u;
        var user = UserService.getUserByKey(loginKey);
        if(user != null){
            userId = user.id
        }else{
            return;
        }

        var fileColumn = selfApi.IsoneBaseEngine.fileColumnService.getDefaultFileColumn(userId);
        var fileObject = selfApi.IsoneBaseEngine.fileService.uploadFiles(request);
        selfApi.IsoneBaseEngine.fileService.addFile(fileObject, fileColumn.optString("id"));
        var fileId = fileObject.getString("fileId");
        var fullpath = selfApi.IsoneBaseEngine.fileService.getFullPath(fileId);
        var juser = $.toJavaJSONObject(user);
        juser.put("pigeonFileId",fileId);
        juser.put("logo",fullpath);
        selfApi.IsoneModulesEngine.memberService.updateUser(juser,userId);

        ret.state = true;
        ret.errorCode = "";
        out.print("ok");
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print("");
        $.log(e)
    }
})();