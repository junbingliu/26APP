//#import Util.js
//#import $oleTrialReport:services/TrialReportService.jsx

/**
 * 更新试用报告的接口,更新的方法是由沈超提供
 */
;(function () {
    var id = $.params.id || "";
    var oneSentence = $.params.oneSentence || "";
    var moodWords = $.params.moodWords || "";
    var feelingWords = $.params.feelingWords || "";
    var compareWords = $.params.compareWords || "";
    var freeWords = $.params.freeWords || "";
    var fileIdList = $.params.fileIdList || "";
    var wordContent = moodWords + "。"+ feelingWords + "。"+ compareWords + "。"+ freeWords + "";//试用报告文字汇总

    var result = TrialReportUtilService.updateReport({
        id: id,
        oneSentence: oneSentence,
        moodWords:moodWords,
        feelingWords:feelingWords,
        compareWords:compareWords,
        freeWords:freeWords,
        wordContent: wordContent,
        fileIdList: fileIdList
    });

    if(result){
        out.print(JSON.stringify({param:"ok",result:result}));
    }

})();