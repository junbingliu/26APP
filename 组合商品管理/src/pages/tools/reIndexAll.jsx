//#import Util.js
//#import login.js
//#import $combiproduct:services/CombiProductService.jsx

(function () {
    var id = $.params["id"];
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            out.print("no privilege");
            return;
        }

        var total = 0, ids = [];
        var recordList = CombiProductService.getAllCombiProducts(0, -1);
        if (id) {
            CombiProductService.buildIndex(id);
            ids.push(jRecord.id + "<br/>");
            total++;
        } else {
            for (var i = 0; i < recordList.length; i++) {
                var jRecord = recordList[i];

                if (!jRecord) {
                    continue;
                }

                CombiProductService.buildIndex(jRecord.id);
                ids.push(jRecord.id + "<br/>");
                total++;
            }
        }

        out.print("total=" + total + "<br/><br/>");
        out.print("ids=" + JSON.stringify(ids));
    } catch (e) {
        out.print("e=" + e);
    }

})();




