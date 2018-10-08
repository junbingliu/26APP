//#import Util.js
//#import login.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 添加修改商品
 */
(function () {
    var id = $.params["id"] || "";
    var activeId  = $.params["activeId"] || "";
    var productId = $.params["productId"] || "";
    var isMember = $.params["isMember"] || "";//是否会员专属
    var isFreight = $.params["isFreight"] || "";//是否需要运费
    var freight = $.params["freight"] || "";
    var cash = $.params["cash"] || "";
    var sellNum = $.params["sellNum"] || 0;
    var integral = $.params["integral"] || "";
    var state = $.params["state"] || "";
    var priority = $.params["priority"] || 0;
    var unitPrice = $.params["unitPrice"] || 0;
    var marketPrice = $.params["marketPrice"] || '';
    var productDescription = $.params["productDescription"] || "";
    var userId = LoginService.getBackEndLoginUserId();
    function changeBoolean(value) {//确定类型是boolean
        var b = true;
        if(value == "true"){
            b = true;
        }else{
            b = false;
        }
        return b;
    }
    var data = {
        id:id,
        activeId:activeId,
        isFreight:changeBoolean(isFreight),
        productId:productId,
        freight:freight,
        cash:Number(cash),
        sellNum:sellNum,
        priority:priority,
        unitPrice:unitPrice,
        marketPrice:marketPrice,
        productDescription:productDescription,
        isMember:changeBoolean(isMember),
        integral:Number(integral),
        state:state,
        responsible:userId
    };
    var obbj = tryOutManageServices.getById(id);
    if(obbj){
        data.hasReport = obbj.hasReport;
    }
    data = tryOutManageServices.addProduct(data);
    if(data){
        var ret = {
            state:"ok",
            data:data
        };
        out.print(JSON.stringify(ret));
    }
})();