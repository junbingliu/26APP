//#import Util.js
//#import login.js
//#import search.js

(function () {
    try {
        var orderBy = $.params.orderBy || "default";
        var fq = "type:fangXing AND deleted:F";
        if ($.params.buildingCode) {
            fq = fq + " AND buildingCode:" + $.params.buildingCode;
        }else{
            fq = fq + " AND buildingCode:xxxxx";
        }
        $.log("\n\n\n\n\n fq = " + fq + " \n\n\n\n\n");
        var searchArgs = {
            fq: fq,
            q: "code:*",
            fl: "id,name,roomtype,size",
            start: 0 + "",
            wt: "json",
            rows: 100 + ""

        };
        var resString = SearchService.searchSolr("isoneEmall", searchArgs);
        //$.log("resString==="+resString)
        var res = JSON.parse(resString);

        var ids = res.response.docs.map(function (doc) {
            return doc.id
        });

        var result = {
            state: "ok",
            lists: res.response.docs
        }

    } catch (e) {
        var result = {
            state: "error",
            msg: e
        }
    }
    out.print(JSON.stringify(result));
})();
