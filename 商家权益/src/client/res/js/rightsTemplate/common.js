function App(name,description,icon,appId){
    this.name = ko.observable(name);
    this.description = ko.observable(description);
    this.icon = ko.observable(icon);
    this.appId = ko.observable(appId);
};

function RightsTemplate(template){
    template = template || {};
    var self = this;
    this.id = ko.observable(template.id);
    this.name = ko.observable(template.name);
    this.description = ko.observable(template.description);
    this.apps = ko.observableArray();
    if(template.apps){
        var apps = $.map(template.apps,function(app){
            return new App(app.name,app.description,app.icon,app.appId);
        });
        this.apps(apps);
    }
    this.maxProductNumber = ko.observable(template.maxProductNumber);
    this.setData = function(templateData){
        self.id(templateData.id);
        self.name(templateData.name);
        self.description(templateData.description);
        self.maxProductNumber(templateData.maxProductNumber);
        if(templateData.apps){
            var apps = $.map(templateData.apps,function(app){
                return new App(app.name,app.description,app.icon,app.appId);
            });
            self.apps(apps);
        }
        else{
            self.apps([]);
        }
    }
    this.editUrl = ko.computed(function(){
        return "#/rightsTemplate/edit/" + self.id();
    });
};