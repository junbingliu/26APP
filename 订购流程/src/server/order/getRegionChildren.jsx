//#import Util.js
//#import saasRegion.js

var regionId = $.params.regionId;
var optionLevel = {};

optionLevel.options = SaasRegionService.getSubRegion(regionId);
var ret = {
    state:'ok',
    regionLevel: optionLevel
};
out.print(JSON.stringify(ret));
