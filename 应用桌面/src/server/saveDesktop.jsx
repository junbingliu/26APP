//#import Util.js
//#import $shell20:service/service.jsx
//#import login.js

var desktopString = $.params.desktop;
var userId = LoginService.getBackEndLoginUserId();
var workspaceId = $.params['workspaceId'];
var w = $.params.w;
var h = $.params.h;
var name = "默认";
var workspace = {
    id:workspaceId,
    name:name,
    w:w,
    h:h,
    desktop:JSON.parse(desktopString)
}
Shell20Service.saveWorkspace(workspace);
Shell20Service.setUserWorkspace(userId,workspace.id,w,h);
var ret = {
    state:"ok",
    id:workspace.id
}
out.print(JSON.stringify(ret));

