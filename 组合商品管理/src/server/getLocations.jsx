//#import Util.js
//#import login.js
//#import $combiproduct:services/CombiProductService.jsx

(function(){
    try{
        var roomIdList=CombiProductService.getRoomIds();
        var result={
            start:"ok",
            lists:roomIdList
        }

    }catch(e){
        var result={
            start:"error",
            msg:e
        }
    }
    return JSON.stringify(result);
})()