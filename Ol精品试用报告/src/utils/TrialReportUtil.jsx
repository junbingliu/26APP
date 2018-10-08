//#import pigeon.js
//#import Util.js
//#import search.js

//#import jobs.js
var TrialReportUtil = (function () {
    var f = {};
    var prefix = "ole_productTrial_reports_";
    var listId = prefix + "list_";
    var indexType = prefix +"index";
    /**
     * 返回字符串的字符数量
     * @param str
     * @returns {number}
     */
    f.getNumOfWords = function (str) {
        var sLen = 0;
        try {
            //先将回车换行符做特殊处理
            str = str.replace(/(\r\n+|\s+|　+)/g, "龘");
            //处理英文字符数字，连续字母、数字、英文符号视为一个单词
            str = str.replace(/[\x00-\xff]/g, "m");
            //合并字符m，连续字母、数字、英文符号视为一个单词
            str = str.replace(/m+/g, "*");
            //去掉回车换行符
            str = str.replace(/龘+/g, "");
            //返回字数
            sLen = str.length;
        } catch (e) {
            $.log(e);
        }
        return sLen;
    };

    f.checkArgument = function (expression, errorMessage) {
        if (!expression) throw new Error(errorMessage);
    };

    /**
     * 检查一句话评论的字数
     * @param param
     */
    f.checkOneSentence = function (param) {

        var num = f.getNumOfWords(param);
        if (num < 5) {
            throw new Error("一句话评论最少5个字！");
        }

        if (num > 15) {
            throw new Error("一句话评论最多15个字！");
        }
    };

    /**
     * 检查报告内容字数
     * @param param
     */
    f.checkWordContent = function (param) {
        var num = f.getNumOfWords(param);

        if (num < 50) {
            throw new Error("报告内容最少50字！");
        }

        if (num > 300) {
            throw new Error("报告内容最多300字！");
        }
    };

    /**
     * 检查上传图片的数量
     * @param param
     */
    f.checkFileIdList = function (param) {
        var len = param.length;
        $.log("\n\n len = "+len+"\n\n");
        if (len < 3) {
            throw new Error("最少上传3张图片!");
        }

        if (len > 9) {
            throw new Error("最多上传9张图片！");
        }
    };
    /**
     * 获取搜索条件
     * @param param
     */
    f.getQueryAttr = function (param) {

        var queryAttr = [{n: "ot", v: indexType, type: 'term'}];
        // $.log("\n\n 1 queryAttr = " + JSON.stringify(queryAttr) + "\n\n");
        if(param.keyword){
            queryAttr.push({n: 'keyword_text', v: param.keyword, type: 'text', op: 'and'});
        }

        if(param.productId){
            queryAttr.push({n: 'productId', v: param.productId, type: 'text', op: 'and'});
        }

        if(param.productObjId){
            queryAttr.push({n: 'productObjId', v: param.productObjId, type: 'text', op: 'and'});
        }

        if(param.activityId){
            queryAttr.push({n: 'activityId', v: param.activityId, type: 'text', op: 'and'});
        }

        if(param.examineStatus){
            queryAttr.push({n: 'examineStatus', v: param.examineStatus, type: 'text', op: 'and'});
        }

        if(param.id){
            queryAttr.push({n: 'id', v: param.id, type: 'text', op: 'and'});
        }

        if(param.orderId){
            queryAttr.push({n: 'orderId', v: param.orderId, type: 'text', op: 'and'});
        }

        if(param.userId){
            queryAttr.push({n: 'userId', v: param.userId, type: 'term', op: 'and'});
        }

        // $.log("\n\n 2 queryAttr = " + JSON.stringify(queryAttr) + "\n\n");
        return queryAttr;
    };

    f.getSortFields = function (orderBy) {
        var sortFields = [{
            field: "likesCount",
            type: "LONG",
            reverse: true
        },{
            field: "examinTime",
            type: "LONG",
            reverse: true
        }];

        // if (orderBy === "time"){
        //     sortFields ={
        //         field: "createTime",
        //         type: "LONG",
        //         reverse: true
        //     };
        // }

        return sortFields;

    };


    return f;
})();