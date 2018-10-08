function UpdateParamPagePage(configs) {
    var self = this;
    self.msg = ko.observable(configs.msg || "");

    self.setData = function (data) {
        data = data || {};
        self.msg(data.msg || "");
    };
    self.getData = function () {
        var data = {};
        data.msg = self.msg();
        return data;
    };
    self.save = function () {
        var postData = ko.mapping.toJS(self.getData());
        if (!postData.msg || postData.msg == "") {
            bootbox.alert("规则提示不能为空");
            return;
        }
        $.post("handler/update_param_handler.jsx", {m: m, appStr: JSON.stringify(postData)}, function (ret) {
            if (ret.state == 'ok') {
                bootbox.alert("保存成功。");
            } else {
                bootbox.alert("保存失败！" + ret.msg);
            }
        }, "JSON");
    };
}