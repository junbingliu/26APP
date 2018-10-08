function AppConfig() {
    var self = this;
    self.url = ko.observable();
    self.container = document.getElementById("searchconsolejsoneditor");
    self.editor = new JSONEditor(self.container);
    self.editor.set({id: 'appConfig_wj'});
    self.status = ko.observable();

    self.go = function () {
        try {
            self.editor.set({});
            $.post("handler/getAppConfig.jsx?type=" + type, {}, function (ret) {
                if (ret.state == 'ok') {
                    self.editor.set(JSON.parse(ret.data));
                } else {
                    self.editor.set({error: "发生错误，" + ret.msg});
                }
            }, "JSON");

        } catch (e) {
            console.log(e);
            self.editor.set({error: "发生错误，" + e});
        }
    };

    self.save = function () {
        var json = self.editor.get();
        $.post("handler/save.jsx", {data: JSON.stringify(json), type: type}, function (ret) {
            if (ret.state == 'ok') {
                alert("保存成功");
            } else {
                alert("保存失败，" + ret.msg);
            }
        }, "JSON");
    }
}

var appConfig = null;
$(function () {
    appConfig = new AppConfig();
    appConfig.go();
    ko.applyBindings(appConfig, document.getElementById("searchConsolePage"));
});