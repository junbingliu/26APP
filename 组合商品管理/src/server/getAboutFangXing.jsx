//#import Util.js
//#import product.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

;(function(){
    try{
        var start= $.params.start;
        var end= $.params.end;
        var aboutFangXings=CombiProductService.getAboutFangXings(start,end);
        var ret={
            state:"ok",
            result:aboutFangXings
        }
    }catch(e){
        var ret={
            state:"error",
            msg:"错误原因为："+e
        }
    }
    out.print(JSON.stringify(ret));
})();