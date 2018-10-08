/*global ShellObject: false */
//#import shellobject.js
/*global ko: false */
function App(params){
    ShellObject.call(this,params);
    this.appId = ko.observable(params.appId);
    this.url = ko.observable(params.url);
}