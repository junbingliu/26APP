var Role = function(id,name,description,creatorMerchantId){
    var self = this;
    self.id = ko.observable(id);
    self.name = ko.observable(name);
    self.description = ko.observable(description);
    self.creatorMerchantId = ko.observable(creatorMerchantId);
}