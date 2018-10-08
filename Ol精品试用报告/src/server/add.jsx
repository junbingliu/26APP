//#import login.js
//#import Util.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx

/**
 * 添加试用报告
 * @param productObjId: 必传参数
 * @param activityId：必传参数
 * @param oneSentence：必传参数
 * @param wordContent：必传参数
 * @param fileIdList：必传参数  文件的fileId
 */
;(function () {
    try {

        // $.log(JSON.stringify( $.params));
        var userId = $.params.userId || ""; // 用户id
        if (!userId) {
            userId = LoginService.getFrontendUserId();//从请求中获取用户的id
        }

        // 添加初始化数据导入标志，初始化导入数据可能不包含图片, 所以在初始化时不校验图片数量
        var initState = $.params.initState || "";
        var channel = $.params.channel || "";

        TrialReportUtil.checkArgument(userId, "用户没有登录！");

        var productObjId = $.params.productObjId || ""; // 试用商品id 不是productId
        TrialReportUtil.checkArgument(productObjId, "商品id不能为空！");

        var activityId = $.params.activityId || ""; // 活动id
        TrialReportUtil.checkArgument(activityId, "活动id不能为空！");
        $.log("\n\nactivityId = " + activityId + "\n\n");


        var orderId = $.params.orderId || ""; //订单id
        TrialReportUtil.checkArgument(orderId, "订单id不能为空！");
        $.log("\n\norder id = " + orderId + "\n\n");


        var oneSentence = $.params.oneSentence || ""; // 一句话评论
        TrialReportUtil.checkArgument(oneSentence, "一句话评论不能为空！");
        if (!initState && !channel) {
            TrialReportUtil.checkOneSentence(oneSentence);
        }

        //可能会分字段传进来，到时候再做修改 TODO
        var moodWords = $.params.moodWords || "";//收到时的心情
        var feelingWords = $.params.feelingWords || "";//该商品的XX感
        var compareWords = $.params.compareWords || "";//与其他商品比较
        var freeWords = $.params.freeWords || "";//自由发言

        var wordContent = moodWords;
        if (feelingWords) {
            if (wordContent) {
                wordContent += "。" + feelingWords;
            } else {
                wordContent = feelingWords;
            }
        }
        if (compareWords) {
            if (wordContent) {
                wordContent += "。" + compareWords;
            } else {
                wordContent = compareWords;
            }
        }
        if (freeWords) {
            if (wordContent) {
                wordContent += "。" + freeWords;
            } else {
                wordContent = freeWords;
            }
        }
        $.log("......................wordContent:" + wordContent);

        TrialReportUtil.checkArgument(activityId, "试用报告文字不能为空！");
        TrialReportUtil.checkWordContent(wordContent);

        var fileIdList = $.params.fileIdList || ""; // 试用报告图片
        $.log("\n\n 1 fileIdList = " + JSON.stringify(fileIdList) + "\n\n");
        fileIdList = fileIdList.split(",");
        $.log("\n\n fileIdList = " + fileIdList + "\n\n");
        if (!initState) {
            TrialReportUtil.checkFileIdList(fileIdList);
        }

        var id = TrialReportUtilService.addTrialReport({
            userId: userId,
            productObjId: productObjId,
            activityId: activityId,
            orderId: orderId,
            oneSentence: oneSentence,
            moodWords: moodWords,
            feelingWords: feelingWords,
            compareWords: compareWords,
            freeWords: freeWords,
            wordContent: wordContent,
            fileIdList: fileIdList
        });
        $.log("\n\n id = " + id + "\n\n");
        ResponseUtil.success({
            id: id
        });

    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();