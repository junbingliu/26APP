//#import Util.js
//#import product.js
//#import login.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

;(function(){
    try{
        var name= $.params.name;
        var id= $.params.id;
        var userId = LoginService.getBackEndLoginUserId();
        CombiProductService.updateAboutFangXing(id,name,userId);
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