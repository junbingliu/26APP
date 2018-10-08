//#import Util.js
//#import login.js
//#import user.js
//#import $oleMobileApi:services/OleShopService.jsx
;(function () {
    //获取所有门店信息接口
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }


    try {
        var loginUserId = LoginService.getFrontendUserId();//当前登陆用户

        if (!loginUserId) {
            setResultInfo("E1M000003","请先登陆");
            return;
        }
        var page = Number($.params["page"]) || 1;
        var limit = Number($.params["limit"]) || 10;

        var regionId = $.params.regionId;//地区编号

        var shopName = $.params.shopName;//门店名称

        var shopid = $.params.shopid;//门店编号
        var lng = Number($.params.lng);//经度
        var lat = Number($.params.lat);//纬度
        var param = {
            shopid : shopid,
            shopName : shopName,
            regionId : regionId
        };
        var resultData = OleShopService.getResultList(param,limit,page);
        //var spec = $.params.spgetShowResultec || "200X200";
        OleShopService.getShowResult(resultData,lng,lat);
        setResultInfo("S0A00000", "success", resultData);




    } catch (e) {
        $.error("查询门店信息失败" + e);
        setResultInfo("E1B0001333","查询门店信息失败" + e);
    }
})();