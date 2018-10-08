//#import Util.js
//#import login.js
//#import search.js

(function () {
    try {
        var orderBy = $.params.orderBy || "default";
        var searchArgs = {
            fq: "type:building AND deleted:F",
            q: "code:*",
            fl: "id,name",
            start: 0 + "",
            wt: "json",
            rows: 100 + ""

        };
        var resString = SearchService.searchSolr("isoneEmall", searchArgs);
        var res = JSON.parse(resString);
        var ids = res.response.docs.map(function (doc) {
            return doc.id
        });

        var result = {
            state: "ok",
            lists: ids
        }

    } catch (e) {
        var result = {
            state: "error",
            msg: e
        }
    }
    out.print(JSON.stringify(result));
})();
