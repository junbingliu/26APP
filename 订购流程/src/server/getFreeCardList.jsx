//#import doT.min.js
//#import Util.js
//#import user.js
//#import DateUtil.js
//#import UserUtil.js
//#import search.js
//#import login.js
//#import file.js
//#import $freeGetCardSetting:services/FreeGetCardSettingService.jsx
//#import $freeGetCardControl:services/FreeGetCardService.jsx

(function () {

    var jResult = {};
    try {
        var userId = LoginService.getFrontendUserId();

        var merchantId = $.params["mid"];

        var listData = FreeGetCardSettingService.getAllGetCardRecordList(merchantId, 0, 20);

        var recordList = [];
        for (var i = 0; i < listData.length; i++) {
            var jRecord = listData[i];
            if (!jRecord) {
                continue;
            }

            jRecord.isGet = false;
            if (jRecord.activityId && jRecord.cardBatchId) {
                var jActivity = FreeGetCardService.getActivity(jRecord.activityId);
                var jResult1 = FreeGetCardService.checkLimitAmount(jActivity, jRecord.cardBatchId, userId);
                if (jResult1.code == "0" || jResult1.code == "204") {
                    if (jResult1.code == "204") {
                        jRecord.isGet = true;
                    }
                } else {
                    continue;
                }
            }

            recordList.push(jRecord);
        }

        var pageParams = {
            state: "ok",
            merchantId: merchantId,
            recordList: recordList,
        };


        out.print(JSON.stringify(pageParams));
    } catch (e) {
        jResult = {
            state: "err",
            error: "错误为：" + e
        };
        out.print(JSON.stringify(jResult))
    }


})();
