//#import Util.js
//#import ViewHistory.js

;(function(){
    try{
        ViewHistoryService.removeProductViewHistory();
    }
    catch(e){
        var ret = {
            state:"err",
            msg:e
        }
    }
})();