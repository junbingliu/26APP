//#import pigeon.js
var NormalBuyFlowSettingService = (function (pigeon) {
    var prefix = "NormalBuyFlow";
    var settingsId = prefix + "_settings";

    var f = {
        Setting:function(data){
            var self = this;
            data = data || {};
            //页头url, 将采用$.inc来包含
            self.headerUrl = data.headerUrl;
            self.footerUrl = data.footerUrl;
        },
        saveSettings : function(settings){
            var s = new f.Setting(settings);
            pigeon.saveObject(settingsId,s);
        },
        getSettings:function(){
            return new f.Setting(pigeon.getObject(settingsId));
        }
    }
    return f;
})($S);