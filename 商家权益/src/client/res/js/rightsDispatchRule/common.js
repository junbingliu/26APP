function RightsDispatchRule(rule){
    var rule = rule || {};
    var self = this;
    self.id = ko.observable(rule.id);
    self.name =ko.observable(rule.name);
    self.description =ko.observable(rule.description);
    self.orgId = ko.observable(rule.orgId);
    self.orgName = ko.observable(rule.orgName);
    self.levelId = ko.observable(rule.levelId);
    self.levelName = ko.observable(rule.levelName);
    self.mainCategoryId = ko.observable(rule.mainCategoryId);
    self.mainCategoryName = ko.observable(rule.mainCategoryName);
    self.customCategoryId = ko.observable(rule.customCategoryId);
    self.customCategoryName = ko.observable(rule.customCategoryName);
    self.templateId = ko.observable(rule.templateId);
    self.templateName = ko.observable(rule.templateName);

    self.setData = function(rule){
        self.id(rule.id);
        self.name(rule.name);
        self.description(rule.description);
        self.orgId(rule.orgId);
        self.orgName(rule.orgName);
        self.levelId(rule.levelId);
        self.levelName(rule.levelName);
        self.mainCategoryId(rule.mainCategoryId);
        self.mainCategoryName(rule.mainCategoryName);
        self.customCategoryId(rule.customCategoryId);
        self.customCategoryName(rule.customCategoryName);
        self.templateId(rule.templateId);
        self.templateName(rule.templateName);
    }

    this.editUrl = ko.computed(function(){
        return "#/rightsDispatchRule/edit/" + self.id();
    });


}