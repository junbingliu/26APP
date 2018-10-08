//#import doT.min.js
//#import Util.js
//#import $oleMobileApi:services/NearbyMerchantService.jsx
;(function () {
    /*业务逻辑
    * 1.验证获取到经纬度的合法性
    * 2.获取全局配送范围，如果没有则用写死的配送范围
    * 3.
                *
                *
                * */
                    var columnId = "col_merchant_all";
                    var jResult = NearbyMerchantService.newJSONObject();

                    // 1.验证获取到经纬度的合法性
                    try {
                        var lng = $.params.lng;
                        var lat = $.params.lat;
                        var merchantType = $.params.merchantType;

                        //检查是否有经纬度传进来
                        if (!lng || !lat) {
                            setResultInfo("E1M000000", "请求参数不能为空");
                            return;
                        }

                        //检查传进来的经纬度是否合法
                        var regExp = /^(-)?\d+(\.\d+)?$/;
                        if (!(regExp.test(lng) && regExp.test(lat))) {
                            setResultInfo("E1M000001", "请求参数格式错误");
                            return;
                        }

                        var a, b, R, lat1, lng1, lat2, lng2;

                        lat1 = lat;
                        lng1 = lng;

                        // 2.获取全局配送范围，如果没有则用写死的配送范围
                        //获取全局默认的配送范围
                        var defaultDistance = NearbyMerchantService.getDefaultDistance("head_merchant", "col_sysargument", "DIST_KEY");

                        //写死的默认配送范围 3千米
                        var distance = 3000;

                        if (defaultDistance && defaultDistance != "") {
                            try {
                                distance = defaultDistance;

                            } catch (e) {
                                $.log(e);
                            }
                        }



                        R = 6378137; // 地球半径
                        lat1 = lat1 * Math.PI / 180.0;

                        var d, sa2, sb2;

                        var merLocation;

                        var matchingMerchant = NearbyMerchantService.newJSONarray();

                        //获取全局的配送范围


                        //获取所有商家
                        var start = 0;
                        var limit = 50;
                        //返回了一个包含了所有商家信息的IsortLists
                        var sortLists = NearbyMerchantService.getMerchantListByList(columnId);
                        var size = sortLists.getSize();
                        //用于存储可配送门店的数组
                        var accessableMerchantList = [];


                        var lists;
                        var ids;
                        var merchantList;

                        while (start < size) {
                            lists = sortLists.getRange(start, limit);//获取前50个商家
                            if (!lists || lists.size() === 0) {
                                break;
                            }
                            start += lists.size();

                            ids = NearbyMerchantService.getIds(lists);
                            //获取商家信息
                            merchantList = NearbyMerchantService.getMerchantListByIds(ids);
                            for (var i = 0, len = merchantList.size(); i < len; i++) {
                                var distanceTemp = distance; //默认的配送范围
                                var jMerchant = merchantList.get(i);//获取的每一个店铺信息

                                var mId = jMerchant.optString("objId");
                                //获取商家后台配置地理位置信息(包括经纬度)
                                var locationArray = NearbyMerchantService.getMerchantLocation(mId);
                                if (!locationArray) {
                                    continue;
                                }
                                merLocation = locationArray.optJSONObject(0);//经纬度

                                /*
                                 * 后台配置为Y,X，例如113,22
                                 * 113是经度
                                 * 22是纬度
                                 * 返回的数据Y代表纬度
                                 * X代表经度
                                 * */

                                var tempLat = "";//纬度
                                var tempLng = "";//经度
                                if (merLocation) {
                                    tempLat = merLocation.optString("Y");
                                    tempLng = merLocation.optString("X");
                                }


                                if (tempLat && tempLng) {

                                    lat2 = tempLat;
                                    lng2 = tempLng;
                                    lat2 = lat2 * Math.PI / 180.0;
                                    a = lat1 - lat2;
                                    b = (lng1 - lng2) * Math.PI / 180.0;

                    sa2 = Math.sin(a / 2.0);
                    sb2 = Math.sin(b / 2.0);
                    d = 2 * R * Math.asin(Math.sqrt(sa2 * sa2 + Math.cos(lat1) * Math.cos(lat2) * sb2 * sb2));

                    if (d < distanceTemp ) {

                        var accessableMerchant = {};
                        // out.print("\n\n"+jMerchant+"\n\n");
                        accessableMerchant.id = jMerchant.optString("id");
                        accessableMerchant.tel = jMerchant.optString("tel");
                        accessableMerchant.name_cn = jMerchant.optString("name_cn");
                        accessableMerchant.name_en = jMerchant.optString("name_en");
                        accessableMerchant.adress = jMerchant.optString("adress");
                        accessableMerchant.email = jMerchant.optString("email");
                        accessableMerchant.lng = merLocation.optString("X");
                        accessableMerchant.lat = merLocation.optString("Y");
                        accessableMerchant.distanceSet = distanceTemp;
                        accessableMerchant.deliverDistance = d;

                        accessableMerchantList.push(accessableMerchant);

                    }
                }

            }

        }
         // 判断是否有可配送门店
        var length = accessableMerchantList.length;
        if (length === 0) {
            setResultInfo("E1M11001", "附近没有可配送门店");
            return;
        }

        //找到配送距离最短的门店
        var jNearestTemp = 3000;
        var near = 0;
        var neareastM = {};
       for(var i  = 0, len = accessableMerchantList.length;i<len;i++){
           near = accessableMerchantList[i].deliverDistance;
           if (near < jNearestTemp){
               jNearestTemp = near;
               neareastM = accessableMerchantList[i];
           }
       }

        jResult.put("nearestMerchant", neareastM);
        jResult.put("accessableMerchantList", accessableMerchantList);

        setResultInfo("S0A00000","操作成功", JSON.parse(jResult.toString()));

    } catch (e){
        $.log("\n\n E1M000002 = " + e + "\n\n\n");
        setResultInfo("E1M000002", "系统异常，请稍候重试");
    }
})();

function setResultInfo(code, msg, data) {
    response.setContentType("application/json");
    var result = {};
    result.code = code;
    result.msg = msg;
    result.data = data || {};
    out.print(JSON.stringify(result));
}