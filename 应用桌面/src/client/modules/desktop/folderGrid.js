/**
 * Created by Administrator on 2014-10-06.
 */
var FolderGrid = function(){
    var self = this;
    self.apps = ko.observable();
    self.name = ko.observable();
    self.desktop = null;
    self.folder = null;
    self.top = 0;
    self.isInFolderPanel = function(position){
        if(position.top>self.top && position.top<self.top + 180){
            return true;
        }
        return false;
    }
    self.drop = function(elem){
        var soid = $(elem.draggable).attr("soid");
        var idx = self.folder.appIds.indexOf(soid);
        if(idx>=0){
            self.folder.appIds.splice(idx,1);
        }
        var folderApps = self.folder.apps();
        var newApps = [];
        $.each(folderApps,function(idx,app){
            if(app.appId!==soid){
                newApps.push(app);
            }
        });
        self.folder.apps(newApps);
        self.apps(newApps);
        $.post("server/createFolder.jsx",{name:self.name(),appIds:self.folder.appIds.join(",")},function(ret){
            self.folder.icon(ret.iconFileUrl);
        },"JSON");
    }
    //self.rename
}
