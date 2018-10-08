//#import pigeon.js
//#import Util.js
//#import doT.min.js
//#import $NormalBuyFlow:service/SettingService.jsx
var m = $.params['m'];
if(!m){
    m="m_100";
}
var settings = NormalBuyFlowSettingService.getSettings();
var template = $.getProgram(appMd5,"pages/setting.jsxp");
var pageData = {merchantId:m,settings:settings};
var pageFn = doT.template(template);
out.print(pageFn(pageData));
