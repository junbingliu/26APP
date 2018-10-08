//#import Util.js
//#import product.js
//#import login.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

;(function(){
    try{
        var name= $.params.name;
        var userId = LoginService.getBackEndLoginUserId();
        CombiProductService.addAboutFangXing(name,userId);
        var ret={
            state:"ok"
        }
    }catch(e){
        var ret={
            state:"error",
            msg:"错误原因为："+e
        }
    }
    out.print(JSON.stringify(ret));
})();