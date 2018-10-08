//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/AdminService.jsx

(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            out.print("no privilege");
            return;
        }

        var adminTypeList = [];
        adminTypeList.push("0");
        adminTypeList.push("1");
        adminTypeList.push("2");

        for (var k = 0; k < adminTypeList.length; k++) {
            var adminType = adminTypeList[k];
            var total = 0;
            var recordList = AdminService.getAllAdminList(adminType, 0, -1);
            for (var i = 0; i < recordList.length; i++) {
                var jRecord = recordList[i];

                if (!jRecord) {
                    continue;
                }

                AdminService.buildIndex(jRecord.id);
                total++;
            }

            out.print("<br>adminType=" + adminType);
            out.print("....total=" + total);
        }

    } catch (e) {
        out.print("e=" + e);
    }

})();




