//#import Util.js
//#import product.js
//#import login.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

;(function(){
    try{
        var id= $.params.id;
        var userId = LoginService.getBackEndLoginUserId();
        CombiProductService.delectAboutFangXing(id);
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