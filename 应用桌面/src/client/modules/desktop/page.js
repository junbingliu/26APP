/**
 * Created with IntelliJ IDEA.
 * User: mac
 * Date: 13-7-10
 * Time: 下午11:17
 * To change this template use File | Settings | File Templates.
 */


function Page(params,desktop){
    this.desktop = desktop;
    var self = this;
    this.shellObjects = ko.observableArray();
    this.pageNum = ko.observable();
    this.isCurPage = ko.observable(params.isCurPage);
    this.setActive = function(){
       self.desktop.setCurPage(self);
    };

    this.isOccupied = function(x,y,w,h){
        //如果newTop,newLeft已被占用，则回到原来的位置
        var occupied = false;
        for(var i=0; i<self.shellObjects().length;i++){
             var obj = self.shellObjects()[i];
            if(obj.overlap(x,y, w, h)){
                return obj;
            }
        }
        return false;
    };

    this.findAvailable = function(x,y,w,h){
        var available = [];
        //找到以x,y为中心的，空的位置
        for(var i=0; i<7; i++){
            for(var j=0; j<4; j++){
                var l = i * 160;
                var t = j * 150;
                if(!self.isOccupied(l,t,w,h)){
                    available.push({x:l,y:t});
                }
            }
        }
        var min = 100000000;
        var minPos = null;
        for(var k=0; k<available.length; k++){
            var p = available[k];
            var distance = (x- p.x)*(x- p.x) + (y- p.y)*(y- p.y);
            if(distance<min){
                min = distance;
                minPos = p;
            }
        }
        return minPos;

    }

    this.doDrop = function(o,position,elem){
        var newTop = Math.round((position.top - 20)/ 150) * 150;
        var newLeft = Math.round((position.left - 80)/ 160) * 160;
        var occupied = self.isOccupied(newLeft,newTop, o.width(), o.height());
        console.log("occupied=" + occupied);
        //如果newTop,newLeft已被占用，则回到原来的位置
        if(!occupied){
            o.top(newTop);
            o.left(newLeft);
            if(o.page != self) {
                if(o.page && o.page.shellObjects){
                    o.page.shellObjects.remove(o);
                }
                self.shellObjects.push(o);
                o.page = self;
            }
            //console.log(desktop.toJson());
            desktop.save();
            return true;
        }
        else{
            if(occupied.id()== o.id()){
                elem.draggable.draggable('option','revert',true);
                setTimeout(function(){elem.draggable.draggable('option','revert',false);},1000);
                return;
            }
            if(occupied.isApp() && o.isApp()){
                var dropped = false;
                layer.prompt({title:"创建新目录，请输入名称:"},function(result){
                    var appIds = [];
                    appIds.push(occupied.appId());
                    appIds.push(o.appId());
                    var newApp = {appId:occupied.appId(),url:occupied.url(),icon:occupied.icon(),name:occupied.name()};
                    var newO = {appId:o.appId(),url:o.url(),icon:o.icon(),name:o.name()};
                    var folderApps = [newApp,newO];
                    dropped = true;
                    $.post("server/createFolder.jsx",{name:result,appIds:appIds.join(",")},function(ret){
                        occupied.name(result);
                        occupied.icon(ret.iconFileUrl);
                        occupied.objType("folder");
                        occupied.appIds = appIds;
                        occupied.apps = ko.observableArray(folderApps);
                        if(o.page && o.page.shellObjects){
                            o.page.shellObjects.remove(o);
                        }
                        desktop.save();
                    },"JSON");

                },function(){
                    //返回原位
                    if(o.page != self) {
                        dropped = true;
                        //如果已经换页
                        var pos = self.findAvailable(newLeft,newTop, o.width(), o.height());
                        o.top(pos.y);
                        o.left(pos.x);
                        if(o.page && o.page.shellObjects){
                            o.page.shellObjects.remove(o);
                        }

                        self.shellObjects.push(o);
                        o.page = self;
                    }
                });
            }
            else if(occupied.isFolder() && o.isApp()){
                var layerIdx = layer.confirm("确定移动 " + o.name() + " 到文件夹 " + occupied.name() + "吗?",
                    function(){
                        var appIds = occupied.appIds;
                        if(!appIds){
                            appIds = [];
                            occupied.appIds = appIds;
                        }
                        appIds.push(o.appId());
                        var newO = {appId:o.appId(),url:o.url(),icon:o.icon(),name:o.name()};
                        occupied.apps.push(newO);
                        $.post("server/createFolder.jsx",{name:occupied.name(),appIds:appIds.join(",")},function(ret){
                            occupied.icon(ret.iconFileUrl);
                            if(o.page && o.page.shellObjects){
                                o.page.shellObjects.remove(o);
                            }
                            desktop.save();
                        },"JSON");
                        layer.close(layerIdx);
                    }
                );

            }
            else{
                //返回原位
                if(o.page != self) {
                    //如果已经换页
                    var pos = self.findAvailable(newLeft,newTop, o.width(), o.height());
                    o.top(pos.y);
                    o.left(pos.x);
                    if(o.page && o.page.shellObjects){
                        o.page.shellObjects.remove(o);
                    }
                    self.shellObjects.push(o);
                    o.page = self;
                }
                else{
                    elem.draggable.draggable('option','revert',true);
                    setTimeout(function(){elem.draggable.draggable('option','revert',false);},1000);
                }
                return true;
            }

        }
    }
    this.drop = function(elem){
        //寻找soid,in elem
        var fromFolder = $(elem.draggable).attr("fromFolder");
        var soid = $(elem.draggable).attr("soid");
        self.desktop.clearRepeat();
        if(fromFolder){
            if(desktop.folderGrid.isInFolderPanel(elem.position)){
                //没有移出folderPanel
                return;
            }
            $.each(desktop.folderGrid.apps(),function(idx,o){
                if(o.appId == soid){
                    o.objType = 'app';
                    var shellApp = new App(o);
                    var position =  elem.position;
                    desktop.allObjects.push(shellApp);
                    self.doDrop(shellApp,position,elem);
                }
            });

            desktop.folderGrid.drop(elem);
            desktop.save();
            return
        }else{
            $.each(self.desktop.allObjects,function(i,o){
                if(o.id()==soid){
                    var position =  elem.position;
                    self.doDrop(o,position,elem);
                }
            });
        }
    }

}
