//#import Util.js
//#import login.js
//#import pigeon.js
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
        var shopid = $.params.shopid;//门店编号
        //var regExp = /^(-)?\d+(\.\d+)?$/;
        if (!shopid) {
            setResultInfo("E1M000003", "门店编号不能为空");
            return;
        }
        var shopName = $.params.shopName;//门店编号
        var shopAddress = $.params.shopAddress;//门店地址
        var regionId = $.params.regionId;//地区ID
        var shopPhone = $.params.shopPhone;//门店客服电话
        var lng = $.params.lng;//经度
        var lat = $.params.lat;//纬度
        var regExp = /^(-)?\d+(\.\d+)?$/;
        if (!(regExp.test(lng) && regExp.test(lat))) {
            setResultInfo("E1M000001", "请求参数格式错误");
            return;
        }
        var saveParam = {
            shopid : shopid,
            shopName : shopName,
            shopAddress : shopAddress,
            regionId : regionId,
            shopPhone : shopPhone,
            lng : lng,
            lat : lat
        };
        var saveFlag = OleShopService.add(saveParam);
        if(saveFlag == 'SUCCESS'){
            setResultInfo("S0A00000", "success", {});
        }else {
            setResultInfo("E1B0001333",saveFlag );
        }





    } catch (e) {
        $.error("查询门店信息失败" + e);
        setResultInfo("E1B0001333","新增门店信息失败" + e);
    }
})();