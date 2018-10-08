function PageConfigEditor(appId, pageId, merchantId, pageData, appEditor) {
    function Item(key,value,type) {
        this.key = ko.observable(key);
        this.name = ko.observable(value.name);
        this.value = ko.observable(value.value);
        this.type = ko.observable(type);
    };

    var self = this;
    self.configs = ko.observableArray();
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    if(pageData.config){
        _.each(pageData.config,function(value,key,list){
            var specName = ("config." + key)
            var dataSpec = _.find(pageData["_all"],function(spec){
                return (spec.id==specName);
            });
            if(dataSpec){
                var item = new Item(key,value,dataSpec.type);
                console.log("key=" + key + ",value=" + value);
                self.configs.push(item);
            };
        });
    }else{
    }
    console.log("configs.length=" + self.configs().length);


    self.save = function () {
        var data = {};
        _.each(self.configs(),function(item){
            var value={};
            value.name=item.name();
            value.value=item.value();
            data[item.key()] = value;
        });
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        param["dataId"] = "config";
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'pageConfig';
        param["dataType"] = "json"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
                $("#pageConfigEditor").modal("hide");
            }
            else {
                bootbox.alert("数据保存成功！");
                pageData.config = data;
                $("#pageConfigEditor").modal("hide");
                appEditor.refresh();
            };
        }, "json");
    };


};