function RoleFormPage(merchantId, roleModel) {
    var self = this;
    self.merchantId = merchantId;
    self.roleModel = roleModel;
    self.mode = ko.observable();
    self.roleId = ko.observable();

    self.name = ko.observable();
    self.description = ko.observable();
    self.selectedApps = ko.observableArray([]);
    self.apps = ko.mapping.fromJS([])
    self.initialized = false;

    self.returnList = function () {
        window.location.href = "#/" + self.merchantId + "/role/list"
    }

    self.getApps = function () {
        $.post("server/roles/getAppsWithActionGroups.jsx", {m: self.merchantId}, function (data) {
            ko.mapping.fromJS(data.apps, self.apps);
            for (var i = 0; i < self.apps().length; i++) {
                var app = self.apps()[i];
                for (var j = 0; j < app.actionGroups().length; j++) {
                    var actionGroup = app.actionGroups()[j];
                    actionGroup.app = app;
                }
            }
        }, "json");
        self.initialized = true;
    }


    self.getActionGroupById = function (actionGroupId) {
        for (var i = 0; i < self.apps().length; i++) {
            var app = self.apps()[i];
            for (var j = 0; j < app.actionGroups().length; j++) {
                var actionGroup = app.actionGroups()[j];
                if (actionGroup.id() == actionGroupId) {
                    return actionGroup;
                }
            }
        }
        return null;
    }
    self.add = function (actionGroup) {
        //search selectedApps
        for (var i = 0; i < self.selectedApps().length; i++) {
            var selApp = self.selectedApps()[i];
            if (selApp.id() == actionGroup.app.id()) {
                //判断是否已经存在
                var found = false;
                for (var j = 0; j < selApp.actionGroups().length; j++) {
                    var a = selApp.actionGroups()[j];
                    if (a.id() == actionGroup.id()) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    selApp.actionGroups.push(actionGroup);
                }
                return;
            }
        }
        var selApp = {
            id: ko.observable(actionGroup.app.id()),
            name: ko.observable(actionGroup.app.name()),
            actionGroups: ko.observableArray([actionGroup])
        }
        self.selectedApps.push(selApp);
        if (actionGroup.app.name().indexOf("已分配") == -1) {
            actionGroup.app.name(actionGroup.app.name() + "(已分配)");
        }
    };
    self.refreshState = function () {
        for (var i = 0; i < self.apps().length; i++) {
            var app = self.apps()[i];
            app.name(app.name().replace("(已分配)", ''));
            for (var k = 0; k < self.selectedApps().length; k++) {
                var selectApp = self.selectedApps()[k];
                if (selectApp.id() == app.id() && app.name().indexOf("已分配") == -1) {
                    app.name(app.name() + "(已分配)");
                    break;
                }
            }
        }
    };
    self.delete = function (actionGroup) {
        for (var i = 0; i < self.selectedApps().length; i++) {
            var selApp = self.selectedApps()[i];
            if (selApp.id() == actionGroup.app.id()) {
                selApp.actionGroups.remove(actionGroup);
                if (selApp.actionGroups().length == 0) {
                    self.selectedApps.remove(selApp);
                }
                self.refreshState();
                return;
            }
        }
    }
    self.save = function () {
        var data = {m: self.merchantId, roleId: self.roleId(), description: self.description(), name: self.name()}
        var actionGroupIds = [];
        for (var i = 0; i < self.selectedApps().length; i++) {
            var app = self.selectedApps()[i];
            for (var j = 0; j < app.actionGroups().length; j++) {
                var actionGroup = app.actionGroups()[j];
                actionGroupIds.push(actionGroup.id());
            }
        }
        data.actionGroupIds = JSON.stringify(actionGroupIds);

        $.post("server/roles/saveRole.jsx", data, function (data) {
            if (data.state == 'ok') {
                bootbox.alert("保存成功！", function () {
                    self.returnList();
                });
            }
            else {
                bootbox.alert("出错了！" + data.msg);
            }
        }, "json");
    }

    self.getSelectedApps = function () {
        self.selectedApps([]);
        if (self.roleId) {
            $.post("server/roles/getRoleActionGroups.jsx", {m: self.merchantId, roleId: self.roleId}, function (data) {
                if (data.state == 'ok') {
                    var groupIds = data.groupIds;
                    $.map(groupIds, function (groupId) {
                        var actionGroup = self.getActionGroupById(groupId);
                        if (actionGroup) {
                            self.add(actionGroup);
                        }
                    })
                    self.refreshState();
                }
            }, "json");
        }
    }
    self.setRole = function (role) {
        if (role != null) {
            self.name(role.name());
            self.roleId(role.id());
            self.description(role.description());
            self.getSelectedApps();
        }
        else {
            self.roleId("");
            self.name("");
            self.description("");
            self.getSelectedApps();

        }
    }

};

var roleFormPage = null;
$(document).ready(function () {
    roleFormPage = new RoleFormPage(merchantId);
    roleFormPage.getApps();//立即初始化
    ko.applyBindings(roleFormPage, document.getElementById("addRolePage"));
});