//#import pigeon.js
var Shell20Service = (function (pigeon) {
    var prefix = "shell20";
    var userWorkspaceList = prefix + "_userWorkspaces_";
    var userWorkspaceBinding = prefix + "_u2w_";
    var f = {
        Workspace : function(data){
          this.name = data.name;
          this.id = data.id;
          this.desktop = data.desktop;
        },
        saveWorkspace:function(workspace){
            if(!workspace.id){
                workspace.id = prefix + "_workspace_" + pigeon.getId(prefix + "_workspace");
            }
            pigeon.saveObject(workspace.id,workspace);
            return workspace.id;
        },
        setUserWorkspace:function(userId,workspaceId,w,h){
            //设置一个用户的workspace
            //检查userId和workspaceId的合法性
            var reg = /\w{1,32}/g; //一个字母，然后跟着字母下划线数字的组合，不能超过32个字
            $.log("userId:" + reg.test(userId));
            $.log("workspaceId:"+ reg.test(userId));
            if(!reg.test(userId) || !reg.test(workspaceId)){
                throw new Error("setUserWorkspace error, userId or workspaceId is not valid." + userId + "," + workspaceId);
            }
            pigeon.saveContent(userWorkspaceBinding+userId+"_"+ w + "_" + h,workspaceId);
            pigeon.addToList(userWorkspaceList+userId,workspaceId,workspaceId);
        },
        getWorkSpace : function(userId,w,h){
            var workspaceId = pigeon.getContent(userWorkspaceBinding+userId+"_"+ w + "_" + h);
            if(!workspaceId){
                return null;
            }
            var w = pigeon.getObject(workspaceId);
            return w;
        },
        removeWorkSpace : function(userId,w,h){
            var workspaceId = pigeon.getContent(userWorkspaceBinding+userId+"_"+ w + "_" + h);
            if(!workspaceId){
                return null;
            }
            var w = pigeon.saveContent(workspaceId,null);
            return w;
        }

    };
    return f;

})($S);