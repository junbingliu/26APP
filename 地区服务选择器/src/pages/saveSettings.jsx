//#import Util.js
//#import saasRegion.js
var regionUrl = $.params.regionUrl;
SaasRegionService.setCurrentRegionUrl(regionUrl);
var ret = {
    state:'ok'
}
out.print(JSON.stringify(ret));
