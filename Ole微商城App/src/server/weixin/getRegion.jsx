//#import Util.js
//#import region.js
//#import saasRegion.js
//#import login.js
//#import column.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
(function () {
    var ret = {};
    var loginUserId = LoginService.getFrontendUserId();

    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return;
    }
    var regionId = $.params.regionId;
    // "c_region_11588";
    if (!regionId || regionId === "") {
        ret.code = "E1M070001";
        ret.msg = "参数缺少";
        out.print(JSON.stringify(ret));
        return
    }
    var pathStr = ColumnService.getColumnIdPath(regionId, "中国", "/");
    var pathList = pathStr.split("/");
    var areaId = pathList[pathList.length - 1];
    var cityId = pathList[pathList.length - 2];
    var provinceId = pathList[pathList.length - 3];

    var provinceChildren = SaasRegionService.getSubRegion("c_region_1602");
    var cityChildren = SaasRegionService.getSubRegion(provinceId);
    var areaChildren = SaasRegionService.getSubRegion(cityId);
    var provinceObj = getAreaObj(provinceChildren, provinceId);
    var cityObj = getAreaObj(cityChildren, cityId);
    var areaObj = getAreaObj(areaChildren, areaId);
    var data = {};

    data.province = provinceObj;
    data.city = cityObj;
    data.area = areaObj;
    data.provinceList = provinceChildren;
    data.cityList = cityChildren;
    data.areaList = areaChildren;

    ret.code = "S0A00000";
    ret.msg = "获取成功";
    ret.data = data;

    out.print(JSON.stringify(ret));
})();

function getAreaObj(areaChildren, regionId) {
    var curArea = {};
    for (var i = 0; i < areaChildren.length; i++) {
        if (areaChildren[i].id == regionId) {
            curArea.id = areaChildren[i].id;
            curArea.name = areaChildren[i].name;
            if (areaChildren[i].parentId) {
                curArea.parentId = areaChildren[i].parentId;
            }
        }
    }
    return curArea;
}
