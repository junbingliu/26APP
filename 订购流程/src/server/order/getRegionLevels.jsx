//#import Util.js
//#import saasRegion.js


(function(){
    var regionId = $.params.regionId;
    var cacheId = "regionLevels_cache_" + regionId;
    var now = new Date().getTime();
    var content = ps20.getContent(cacheId);
    if(content){
        var cache = JSON.parse(content);

        if(now - cache.t < 15 * 60 * 1000){
            out.print(cache.response);
            return;
        }
    }

    var regionPath = [];
    if(regionId){
        regionPath  = SaasRegionService.getFullPathObjects(regionId);
    }
//    var rootRegion = SaasRegionService.getRootRegion();
//    var parentId =rootRegion.id;
    var optionLevel = {};
    var optionLevels = [];
//
//    optionLevel.options = SaasRegionService.getSubRegion(parentId);
//    optionLevels.push(optionLevel);

    //如果有中国这一级别就从i=1开始，否则从i=0开始
    for(var i=0;i<regionPath.length;i++){
        var currentRegion = regionPath[i];
        optionLevel.currentId = currentRegion.id;
        //新optionLevel
        optionLevel = {};
        parentId = currentRegion.id;
        optionLevel.options = SaasRegionService.getSubRegion(parentId);
        optionLevels.push(optionLevel);
    };




    var ret = {
        state:'ok',
        regionLevels: optionLevels
    };
    //这个页面比较慢，我们想办法加速
    var responseString = JSON.stringify(ret)
    var cache = {
        t:now,
        response:responseString
    }
    ps20.saveContent(cacheId,JSON.stringify(cache));
    out.print(responseString);
})();




