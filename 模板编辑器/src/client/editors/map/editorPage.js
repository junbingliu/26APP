function BuildingItem(param){
    var self=this;
    self.id=ko.observable(param.id);
    self.name=ko.observable(param.name);
    self.address=ko.observable(param.address);
    self.selected = ko.observable(false);
    self.floors=ko.observableArray(param.floors);
};
function FloorItem(param){
    var self=this;
    self.id=ko.observable(param.id);
    self.name=ko.observable(param.name);
    self.selected = ko.observable(false);
    self.imgLink=ko.observableArray(param.imgLink);
};
function MapEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.buildings=ko.observableArray([]);
    self.buildingDialog = new BuildingDialog(self.buildings);
    self.floors=ko.observableArray([]);
    self.floorDialog=new FloorDialog(self.floors);
    self.showFloorEditor=ko.observable(false);
    self.selectBuilding=function(item){
       self.select(self.buildings,item);
       self.showFloorEditor(true);
    }
    self.selectFloor=function(item){
       self.select(self.floors,item);
    }
    self.select = function (items,item) {
        for(var i=0;i<items().length;i++){
            items()[i].selected(false);
        }
        item.selected(true);
    };
    self.deleteBuildingItem=function(item){
        self.buildings.remove(item);
    };
    self.editBuildingItem=function(item){
        self.buildingDialog.openDialog(item);
    };
    self.deleteFloorItem=function(item){
        self.floors.remove(item);
    };
    self.editFloorItem=function(item){
        self.floorDialog.openDialog(item);
    };
    self.returnMainFrame = function () {
        self.appEditor.setCurrentPage("mainFrame");
        self.appEditor.refresh();
    };
};
function BuildingDialog(buildings) {
    var self = this;
    self.id = ko.observable(0);
    self.name = ko.observable("");
    self.address = ko.observable("");
    self.openDialog = function (currentItem) {
        self.currentItem = currentItem;
        if (currentItem.id) {
            self.name(currentItem.name());
            self.address(currentItem.address());
            self.id(currentItem.id());
        }else{
            self.init();
        }
        $('#building_addItem').modal("show");
    };
    self.init=function(){
        self.name("");
        self.address("");
    }
    self.ok = function () {
        if(self.currentItem.id){
            self.currentItem.id(self.id());
            self.currentItem.name(self.name());
            self.currentItem.address(self.address());
        }else{
            var buildingData={id:self.id()+1,name:self.name(),address:self.address()};
            var buildingItem=new BuildingItem(buildingData);
            buildings.push(buildingItem);
        }
        $('#building_addItem').modal("hide");

    }
};
function FloorDialog(floors) {
    var self = this;
    self.id = ko.observable(0);
    self.name = ko.observable("");
    self.imgLink = ko.observable("");
    self.openDialog = function (currentItem) {
        self.currentItem = currentItem;
        if (currentItem.id) {
            self.id(currentItem.id());
            self.name(currentItem.name());
        }else{
            self.init();
        }
        $('#floor_addItem').modal("show");
    };
    self.init=function(){
        self.name("");
    }
    self.ok = function () {
        if(self.currentItem.id){
            self.currentItem.id(self.id());
            self.currentItem.name(self.name());
        }else{
            var floorData={id:self.id()+1,name:self.name(),imgLink:self.imgLink};
            var floorItem=new FloorItem(floorData);
            floors.push(floorItem);
        }
        $('#floor_addItem').modal("hide");

    }
};
