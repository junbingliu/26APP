//#import Util.js
//#import appraise.js

;(function(){
    try{
        var id = $.params.id;
        var appraisePage = $.params.appraisePage||"1";
        //获取评价内容
        var appraisSearchArgs={"productId":id,"effect":"true","searchIndex":true,"doStat":true,"page":appraisePage,"limit":5,"logoSize":"50X50"};
        var ret=AppraiseService.getProductAppraiseList(appraisSearchArgs);
        var recordList=[];
        if(ret){
            recordList = ret.recordList;
        }
        out.print(JSON.stringify(ret));
    }
    catch(e){
        var ret = {
            state:"err",
            msg:e
        }
        out.print(JSON.stringify(ret));
    }
})();