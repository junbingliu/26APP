//#import Util.js
//#import saasRegion.js
(function(){
    var now = new Date().getTime();
    response.setContentType("application/json");
    var parentId = $.params.regionId;
    if(!parentId) {
        parentId = "c_region_1602";
    }

    var cacheId = "regionChildrenCache_" + parentId;
    var content = ps20.getContent(cacheId);
    if(content){
        var cache = JSON.parse(content);
        var now = new Date().getTime();
        if(now - cache.t < 15 * 60 * 1000){
            out.print(cache.response);
            return;
        }
    }

    var children = SaasRegionService.getSubRegion(parentId);
    var ret={}
     ret.data = {
        state:"ok",
        regionId:parentId,
        children:children
    }
    var responseString = JSON.stringify(ret)
    var cache = {
        t:now,
        response:responseString
    }
    ps20.saveContent(cacheId,JSON.stringify(cache));
    out.print(responseString);
})()