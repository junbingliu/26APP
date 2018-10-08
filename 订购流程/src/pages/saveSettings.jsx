//#import Util.js
//#import $NormalBuyFlow:service/SettingService.jsx

var headerUrl = $.params.headerUrl;
var footerUrl = $.params.footerUrl;
NormalBuyFlowSettingService.saveSettings({
   headerUrl:headerUrl,
   footerUrl:footerUrl
});
var ret = {
    state:'ok'
}
out.print(JSON.stringify(ret));
