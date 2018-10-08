function Consignee() {
    var self = this;
    self.consigneeList = ko.observableArray();
    self.currConsignee = ko.observable();
    self.selectedAddressId = ko.observable();
    self.editFormVisible = ko.observable(false);
//    self.showMore = ko.observable(false);
//    self.showCount = ko.observable(2);
    self.buyerId = null;
    self.callback = null;
    self.regionSelector = new OptionSelector();
    self.regionSelector.registerChangeHandler(function(optionSelector,optionLevel){
        if(optionLevel.currentOptionId()){
            self.loadRegionChildren(optionLevel.currentOptionId());
        }
    });

    self.selectedAddressId.subscribe(function(newValue){
        if(newValue=='none'){
            self.newConsignee();
        }
        else {
            if(self.editFormVisible()){
                $.each(self.consigneeList(), function (index, elem) {
                    if (elem.id() == newValue) {
                        self.edit(elem);
                    }
                });
            }
            else{
                $.each(self.consigneeList(), function (index, elem) {
                    if (elem.id() == newValue) {
                        self.selectConsignee(elem);
                    }
                });
            }
        }
    });


    self.selectConsignee = function(consignee,callback){
        self.selectedAddressId(consignee.id());
        self.setCurrentConsignee(consignee,callback);

        /*if(self.editFormVisible()){
            self.setCurrentConsignee(consignee);
        }*/
    };


    self.getCurrentConsignee = function(){
        var consignee = null;
        $.each(self.consigneeList(),function(index,elem){
            if(elem.id()==self.selectedAddressId()){
                consignee = elem;
            }
        });
        return consignee;
    };
    self.confirmSelection = function(){
       var consignee = self.getCurrentConsignee();
        if(!consignee){
            confirmDialog.show("请选择一个地址。",null);
        }
        $.post(AppConfig.url+AppConfig.setDefaultAddressUrl,{buyerId:self.buyerId,addressId:consignee.id()},function(ret){
            if(ret.state=='ok'){
                if(self.callback){
                    self.callback(consignee);
                }
            }
            else{
                confirmDialog.show(ret.msg,null);
            }
        },"json");

    };
    self.loadRegionChildren = function(regionId){
        $.post(AppConfig.url+AppConfig.getRegionChildrenUrl,{regionId:regionId},function(ret){
            if(ret.state=='ok'){
                self.regionSelector.addOptionLevel(ret.regionLevel);
            }
        },"JSON");
    };

    self.loadRegion = function(regionId,callback){
        $.post(AppConfig.url+AppConfig.getRegionLevelsUrl,{regionId:regionId||"c_region_1602"},function(ret){
            if(ret.state=='ok'){
                self.regionSelector.setOptionLevels(ret.regionLevels);
                typeof(callback) == "function"?callback():null;
            }
        },"JSON");
    };

    self.setCurrentConsignee = function(consignee, callback){
        self.currConsignee(consignee);
        self.loadRegion(consignee.regionId(),callback) /*  bug  */
    };


    self.back = function () {
        history.go(-1);
    };
    self.getConsigneeList = function () {
        var postData = {
            buyerId:self.buyerId
        };
        $.post(AppConfig.url+AppConfig.addressListUrl, postData,function (result) {
            self.consigneeList.removeAll();
            if (result.status == 'err') {
                bootbox.alert(result.msg);
            } else {
                var addressList = result.addressList;
                if(!addressList || addressList.length==0&&(!AppConfig.platform||AppConfig.platform!="mobile")){
                    self.newConsignee();
                    return;
                }
                for (var i = 0; i < addressList.length; i++) {
                    var param = {};
                    param.id = addressList[i].id;
                    param.region = addressList[i].region;
                    param.regionId = addressList[i].regionId;
                    param.regionIds = addressList[i].regionIds;
                    param.mobile = addressList[i].mobile;
                    param.userName = addressList[i].userName;
                    param.address = addressList[i].address;
                    param.postalCode = addressList[i].postalCode;
                    param.isDefault = addressList[i].isDefault;
                    param.regionName = addressList[i].regionName;
                    param.certificate = addressList[i].certificate;
                    var consignee = new ConsigneeAddress(param);
                    self.consigneeList.push(consignee);
                    //设置默认配送防谁
                    if(self.selectedAddressId()==addressList[i].id){
                        self.currConsignee(consignee);
                    }
                }
            }

        }, "json")
    };

    self.show = function () {
        if (self.showMore()) {
            self.showMore(false);
            self.showCount(2);
        } else {
            self.showMore(true);
            self.showCount(5);
        }
    };

    self.newConsignee = function(){
        //新增加地址

        self.editFormVisible(true);
        self.selectedAddressId('none');
        //self.loadRegion(); /*  debugger   */
//        if(self.currConsignee()){
//            var data = ko.mapping.toJS(self.currConsignee());
//            data.id = "none";
//            self.setCurrentConsignee(new ConsigneeAddress(data));
//        }
//        else{
            self.setCurrentConsignee(new ConsigneeAddress({id:'none',mobile:AppConfig.mobile}));

//        }

    };

    self.edit = function(consignee){
        self.editFormVisible(true);
        //self.setCurrentConsignee(consignee);
        self.selectConsignee(consignee);
    };
    self.deleteAddress = function(consignee){

            $.post(AppConfig.url+AppConfig.deleteAddressUrl,{buyerId:self.buyerId,addressId:consignee.id()},function(ret){
                if(ret.state=='ok'){
                    self.consigneeList.remove(consignee);
                }
            },"json");

    };

    self.hideEditForm = function(){
        self.editFormVisible(false);
    };
    self.cancelEdit = function(){
        self.hideEditForm();
    };

    self.saveData = function () {
        var reqParam = {buyerId:self.buyerId};
        reqParam.userName = self.currConsignee().userName();
        reqParam.mobile = self.currConsignee().mobile();
        reqParam.address = self.currConsignee().address();
        reqParam.isDefault = self.currConsignee().isDefault();
        reqParam.postalCode = self.currConsignee().postalCode();
        reqParam.regionId = self.regionSelector.getCurrentOptionId() || self.currConsignee().regionId();
        reqParam.addressId = self.currConsignee().id();
        if(!reqParam.userName){
            confirmDialog.show("收货人是必填的。");
            return;
        }
        if(!reqParam.address){
            confirmDialog.show("地址是必填的。");
            return;
        }
        if(!reqParam.mobile){
            confirmDialog.show("电话号码是必填的。");
        }else{

            //定义手机验证正则 不在这里做验证,在服务端做验证
           /* var isMobile=/^1[3|4|5|8][0-9]\d{4,8}$/;
            if(!isMobile.test(reqParam.mobile)){
                confirmDialog.show("电话号码格式错误");
                return;
            }*/
        }
        if(!reqParam.regionId){
            confirmDialog.show("请选择地区到最后一级。");
            return;
        }

        $.post(AppConfig.url+AppConfig.saveAddressUrl, reqParam, function (result) {
            if(result.state=='ok'){
                if(self.callback){
                    self.editFormVisible(false);
                    self.callback();
                }
                else{
                    self.getConsigneeList();
                    self.hideEditForm();
                }
            }else {
                confirmDialog.show(result.msg,null);
            }
        }, "JSON")
    }
    self.setCallback = function (callback) {
        self.callback = callback;
    }
};

/*
var consignee = null;
$(document).ready(function () {
    consignee = new Consignee();
    ko.applyBindings(consignee, document.getElementById("consigneePage"));
});
*/
