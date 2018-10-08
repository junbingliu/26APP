//#import pigeon.js
//#import Util.js
//#import search.js

(function () {
    var listObjects = ps20.getList("shopinfo_list", 0, 100);
    $.log("listObjects.length="+listObjects.size());
    var docs = [];
    var ids = "";
    for (var i = 0; i < listObjects.size(); i++) {
        var lo = listObjects.get(i)
        var lokey = lo.getKey();
        var clsstr = ps20.getContent(lokey);
        $.log("cls==="+clsstr);
        if (clsstr) {
            var cls = JSON.parse(clsstr);
            ids = ids + cls.id + ",";
            var doc = {};
            doc.id = cls.id;
            doc.area = cls.area;//大区
            doc.areacode = cls.areacode;//大区编码
            doc.province = cls.province;//省
            doc.provincecode = cls.provincecode;//省编码
            doc.city = cls.city;//省编码
            doc.citycode = cls.citycode;//省编码
            doc.shopid = cls.shopid;//省编码
            doc.shopname = cls.shopname;//省编码
            docs.push(doc);
        }
    }
    ids = ids.substr(0,ids.length-1);
    $.log("idArray11==="+ids);
    if (docs.length == 0) {
        return;
    }
    $.log("idArray12");
    SearchService.index(docs, ids);
    $.log("idArray13");
})();