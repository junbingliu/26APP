//#import Util.js
//#import login.js
//#import user.js
//#import jobs.js
//#import $oleMemberClass:services/PushManagementService.jsx

(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        var totalRecords = PushManagementService.getAllNewListSize();
        var records = PushManagementService.getAllNewList(0, 100);
        // out.print(JSON.stringify(records));
        for (var i = 0; i < records.length; i++) {
            // if (i >= 1) {
            //     return;
            // }
            var record = records[i];
            var id = record.id;
            record.systemRecords = [];
            record.pushRecords = [];
            record.modifier = loginUserId;
            PushManagementService.updatePushOperationRecord(record);
            // out.print("<br>records[" + i + "]==>" + JSON.stringify(records));
            // if (!id || id == undefined || id == null) {
            //     continue;
            // }
            // out.print("<br>id==>" + id);
            // PushManagementService.buildIndex(id);
        }
    } catch (e) {
        out.print(e);
    }
})();

