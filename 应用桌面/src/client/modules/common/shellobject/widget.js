/*global ShellObject: false */
//#import shellobject.js
/*global ko: false */
function Widget(params){
    ShellObject.call(this,params);
    var self = this;
    if(typeof params != 'undefined'){
        this.appId = params.appId;
    }


}