function TabItem(param){
    this.content = ko.observable(param.content||"");
    this.linkTo = ko.observable(param.linkTo||"");
    this.openInNewPage=ko.observable(param.openInNewPage||"_blank");
    this.recordId = param.recordId||"";
}
function TabsPlusEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.tabList=ko.observableArray([]);
    self.isMakeRecordId = false;
    self.addItem=function(){
        var newItem=new TabItem({});
        self.tabList.push(newItem);
    };
    self.init=function(){
        self.tabList.removeAll();
        self.addItem();
    };
    self.init();
    self.closeTabsPlusEditor = function(){
        $("#TabsPlusEditor").hide();
    };
    self.delete = function (item) {
        self.tabList.remove(item);
    };
    self.up=function(item){
        var index=self.tabList.indexOf(item);
        if(index==0){return};
        var array=self.tabList();
        var temp=array[index-1];
        array[index-1]=array[index];
        array[index]=temp;
        self.tabList(array);
    };
    self.down=function(item){
        var index=self.tabList.indexOf(item);
        if(index==self.tabList().length-1){return};
        var array=self.tabList();
        var temp=array[index+1];
        array[index+1]=array[index];
        array[index]=temp;
        self.tabList(array);
    };
    self.saveDataToDB=function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };

        if(self.isMakeRecordId){
            function randomNum(){
                var num = "";
                for(var r=0;r<6;r++){
                    num += Math.floor(Math.random() * 10);
                }
                return num + "";
            }
            var list = self.tabList();
            if(list.length > 0){
                list.forEach(function(item){
                    var id = item.recordId;
                    if(!id){
                        item.recordId = randomNum();
                    }
                });
            }
        }

        var data = ko.mapping.toJS(self.tabList);
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'tabsPlus';
        param["dataType"] = "jsonArray"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            };
            self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
            self.closeTabsPlusEditor();
            self.appEditor.refresh();
        }, "json");
    };
};
