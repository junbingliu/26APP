//#import Util.js
//#import app.js
//#import file.js
//#import merchantRights.js
//#import login.js
//#import $shell20:service/service.jsx
//#import SaasRoleAssign.js

var totalRows = 5;
var totalCols = 7;
var Desktop = function(){
    var self = this;
    this.pages = [];
    this.currentPage;
    this.currentPagePos;
    this.totalRows = 3;
    this.totalCols = 6;
    this.newPage = function(){
        var pagePos = [];
        for(var row=0; row<this.totalRows; row++){
            pagePos[row] = [];
            for(var col=0; col<this.totalCols; col++){
                pagePos[row][col] = 0;
            }
        }
        self.currentPage = {objs:[]};
        this.pages.push(self.currentPage);
        self.currentPagePos = pagePos;
    }

    this.put = function(app){
        var pagePos = self.currentPagePos;
        for(var row=0; row<this.totalRows; row++){
            for(var col=0; col<this.totalCols; col++){
                if(pagePos[row][col]==0){
                    app.left = col;
                    app.top = row;
                    app.width = 1;
                    app.height = 1;
                    pagePos[row][col] = 1;
                    self.currentPage.objs.push(app);
                    return;
                }
            }
        }
        //已经满了
        this.newPage();
        this.put(app);
    }
    this.newPage();
}


var merchant = $.params['m'];
if(!merchant){
    merchant = $.getDefaultMerchantId();
}
var userId = LoginService.getBackEndLoginUserId();
var w = $.params.w;
var h = $.params.h;
w = 0;
h = 0;
try{
    var workspace = Shell20Service.getWorkSpace(userId,w,h);
}
catch(e){
    workspace = null;
}

var apps = AppService.getIndependentApps(merchant,0,-1);
var ruleApps = MerchantRightsService.getAvailableApps(merchant);
if(ruleApps){
    apps = apps.concat(ruleApps);
}
apps = SaasRoleAssignService.filterByUserPrivilege(apps,merchant,userId);

function findApp(appId){
    for(var i=0; i<apps.length; i++){
        var tApp = apps[i];
        if(tApp.id == appId){
            return tApp;
        }
    }
    return null;
}
function isValid(apps,app){
    for(var i=0; i<apps.length; i++){
        var tApp = apps[i];
        if(tApp.id == app.appId){
            tApp.existed = true;
            app.name = tApp.name;
            return true;
        }
    }
    return false;
}
function findPos (page){
   for(var i=0; i<totalRows; i++){
       for(var j=0; j<totalCols; j++){
           var occupied = false;
           for(var k=0; k<page.objs.length; k++){
               var app = page.objs[k];
               if(app.top==i && app.left==j){
                   occupied = true;
                   break;
               }
           }
           if(!occupied){
               return [i,j];
           }
       }
   }
    return null;
}
if(workspace){
    var d = workspace.desktop;

    for(var i=0; i< d.pages.length; i++){
        var page = d.pages[i];
        var objs = [];
        for(var j=0; j< page.objs.length; j++){
            var app = page.objs[j];
            if(app.objType=='app'){
                var meta = AppService.getAppMeta(app.appId);
                app.meta = meta;
                if(meta.isWidget==true){
                    continue;
                }
                if(isValid(apps,app)){
                    app.url = '/' + app.appId + "/home.jsx?m=" + merchant;
                    objs.push(app);
                    app.existed = true;
                }
            }
            if(app.objType=='folder'){
                $.log(JSON.stringify(app));
                objs.push(app);
                app.existed = true;
                var appIds = app.appIds;
                var subApps = [];
                if(appIds && appIds.length>0){
                    appIds.forEach(function(id){
                        var subApp = findApp(id);
                        if(subApp){
                            subApp.url = '/' + app.appId + "/home.jsx?m=" + merchant;
                            subApp.existed = true;
                            var icon = FileService.getRelatedUrl(subApp.iconFileId,"");
                            subApp.icon = icon;
                            subApp.appId = id;
                            subApp.id=id;
                            subApp.url = '/' + subApp.appId + "/home.jsx?m=" + merchant;
                            subApps.push(subApp);
                        }
                    });
                }
                app.apps = subApps;
            }
        }
        page.objs = objs;
    }
    apps.forEach(function(app){
        var meta = AppService.getAppMeta(app.id);
        if (meta.isWidget == true) {
            return;
        }
        if(!app.existed){
            var found = false;
            for(var i=0; i< d.pages.length; i++){
                var page = d.pages[i];
                var pos = findPos(page);
                if(pos){
                    if(app.iconFileId){
                        icon = FileService.getRelatedUrl(app.iconFileId,"");
                    }
                    var shellApp = {appId:app.id,name:app.name,icon:icon,objType:'app',url:'/' + app.id + "/home.jsx?m=" + merchant};
                    shellApp.left = pos[1];
                    shellApp.top = pos[0];
                    shellApp.width = 1;
                    shellApp.height = 1;
                    page.objs.push(shellApp);
                    found = true;
                    break;
                }
            }
            if(!found){
                var newPage = {objs:[]};
                d.pages.push(newPage);
                if(app.iconFileId){
                    icon = FileService.getRelatedUrl(app.iconFileId,"");
                }
                var shellApp = {appId:app.id,name:app.name,icon:icon,objType:'app',url:'/' + app.id + "/home.jsx?m=" + merchant};

                shellApp.left = 0;
                shellApp.top = 0;
                shellApp.width = 1;
                shellApp.height = 1;
                newPage.objs.push(shellApp);

            }
        }
    });
    out.print(JSON.stringify({pages: d.pages}));
}
else{
    var desktop = new Desktop();
    for(var i=0; i<apps.length;i++){
        var app = apps[i];
        var meta = AppService.getAppMeta(app.id);
        $.log(JSON.stringify(meta));
        if(meta.isWidget==true){
            continue;
        }
        var icon =  null;
        if(app.iconFileId){
            icon = FileService.getRelatedUrl(app.iconFileId,"");
        }
        var shellApp = {appId:app.id,name:app.name,icon:icon,objType:'app',url:'/' + app.id + "/home.jsx?m=" + merchant};
        desktop.put(shellApp);
    }

    out.print(JSON.stringify({pages:desktop.pages}));
}






