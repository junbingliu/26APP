//#import Util.js
//#import column.js
//#import @server/util/ErrorCode.jsx

(function () {
    var regionId = $.params.regionId || "c_region_1602";//默认是中国的根节点

    var ret = ErrorCode.S0A00000;
    var jRoot = ColumnService.getColumn(regionId);
    if (!jRoot) {
        ret = ErrorCode.region.E1M070001;
        out.print(JSON.stringify(ret));
        return;
    }

    function getProvinces(topRegion) {
        return getChildren(topRegion, "province");
    }

    function getChildRegions(parents, type) {
        var cities = [];
        for (var i = 0; i < parents.length; i++) {
            var jParent = parents[i];
            cities = cities.concat(getChildren(jParent, type));
        }
        return cities;
    }

    function getChildren(jParent, childType) {
        if (!jParent || !childType) {
            return null;
        }
        var regionId = jParent.id;
        var result = [];
        var children = ColumnService.getChildren(regionId);
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var jChild = children[i];
                jChild.type = childType;
                result.push({
                    id: jChild.id,
                    parentId: jChild.parentId,
                    name: jChild.name,
                    pos: jChild.pos,
                    type: childType
                });
            }
        }
        return result;
    }

    function convert(list) {
        if (!list) {
            return null;
        }
        var obj = {};
        for (var i = 0; i < list.length; i++) {
            var jRegion = list[i];
            obj[jRegion.id] = jRegion;
        }
        return obj;
    }

    var provinces = getProvinces(jRoot);//获取省
    var cities = getChildRegions(provinces, "city");//获取市
    var districts = getChildRegions(cities, "district");//获取区
    provinces = convert(provinces);
    cities = convert(cities);
    districts = convert(districts);
    ret.data = {
        provinces: provinces,
        cities: cities,
        districts: districts
    };
    out.print(JSON.stringify(ret));
})();