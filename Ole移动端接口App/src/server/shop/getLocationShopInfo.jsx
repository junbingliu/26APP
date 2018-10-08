//#import Util.js
//#import login.js
//#import user.js
//#import $oleMobileApi:services/OleShopService.jsx
;(function () {
    //获取所有门店定位信息接口
    //接口Idcrv.ole.shop.getLocationShopInfo
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

        // if (!loginUserId) {
        //     setResultInfo("E1M000003","请先登陆");
        //     return;
        // }
        var page = 1;
        var limit = 100;

        var lng = Number($.params.lng);//经度
        var lat = Number($.params.lat);//纬度
        var param = {
        };
        var shopData = null;// 门店信息
        if(!lng || !lat){
            shopData = {};
        }else {
            var param = {

            };
            var shopResult = OleShopService.getResultList(param,100,1);

            var shopList = shopResult.list;

            for(var i = 0; i < shopList.length; i ++){

                if(!shopList[i].lng || !shopList[i].lat ){
                    continue;
                }

                var point1 = {
                    lng : lng,
                    lat : lat
                }
                var point2 = {
                    lng : shopList[i].lng ,
                    lat : shopList[i].lat
                }
                $.log("\n\n 门店点位 = "+shopList[i].shopName+"point1=" + JSON.stringify(point1) + "\n\n");
                $.log("\n\n 门店点位 = "+shopList[i].shopName+"point2=" + JSON.stringify(point2) + "\n\n");

                var distance = OleShopService.getDistance(point1,point2);
                distance = distance == null ? 0 : distance;
                $.log("\n\n 门店点位 = "+shopList[i].shopName+"距离=" + distance + "\n\n");
                if(shopData != null){
                    if(distance < 3000 && shopData.distance > distance){
                        shopData = shopList[i];
                        shopData.distance = distance;
                    }
                }else if(distance < 3000){
                    shopData = shopList[i];
                    shopData.distance = distance;
                }
            }
        }

        setResultInfo("S0A00000", "success", {"shopInfo":shopData == null ? {} : shopData});




    } catch (e) {
        $.error("定位门店信息失败" + e);
        setResultInfo("E1B0001333","定位门店信息失败" + e);
    }
})();