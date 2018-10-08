//#import Util.js
//#import product.js
//#import login.js
//#import search.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

var loginUserId = LoginService.getBackEndLoginUserId();
var keyword = $.params.keyword;
var certified = $.params.certified;
var published = $.params.published;
var start = $.params.start;
var limit = $.params.limit;
var m = $.params.m;

if (!keyword) {
    keyword = "*";
} else {
    keyword = "\"" + keyword + "\"";
}

var qs = "";
if (m == "head_merchant") {
    qs = "type:combiProduct AND deleted:F";
} else {
    qs = "merchantId:" + m + " AND " + "type:combiProduct AND deleted:F";
}
if (published && certified) {
    qs = qs + " AND ( published:F OR certified:F)"
}
var searchArgs = {
    fq: qs,
    q: "keyword_text:" + keyword,
    fl: "id",
    start: start,
    wt: "json",
    rows: limit
};

var resString = SearchService.searchSolr("isoneEmall", searchArgs);
var res = JSON.parse(resString);
//var res = SearchService.directSearch("combiProduct",searchArgs);
//$.log("====res========:"+JSON.stringify(res));
var total = res.response.numFound;
var ids = res.response.docs.map(function (doc) {
    return doc.id
});
var combiProducts = CombiProductService.getCombiProducts(ids);

/*var searchArgs2 = {
 fq:"type:combiMerchants AND deleted:F",
 q:"createTime:"+"*",
 fl:"id",
 start:"0",
 wt:"json",
 rows : "200"
 };
 var res2 = SearchService.directSearch("combiMerchants",searchArgs2);
 $.log("=============res===============:"+JSON.stringify(res2));*/

var ret = {
    state: "ok",
    combiProducts: combiProducts,
    total: total,
    start: start
};

out.print(JSON.stringify(ret));




