/*global ShellObject: false */
//#import shellobject.js
/*global ko: false */
function Folder(params){
    ShellObject.call(this,params);
    var self = this;
    self.apps = ko.observableArray(params.apps);
    self.appIds= params.appIds;
}