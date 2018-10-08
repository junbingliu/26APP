//#import Util.js
//#import login.js
//#import user.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import search.js

(function () {
    var ret = {
        code: 'E1B120006',
        msg: ""
    };
    try {
        //var areacode = $.params.areacode;//大区编码
        var provincecode = $.params.provincecode;//省编码
        var citycode = $.params.citycode;//市编码
        var start = $.params.start || 0;//索引页
        var limit = $.params.limit || 50;//索引条数

        //查询门店信息
        var searchArgs = {
            fetchCount: limit,
            fromPath: start
        };
        if(!citycode || citycode == null){
            ret.msg = "城市编码不能为空";
            ret.code = "E1B120010";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!provincecode || provincecode == null){
            ret.msg = "省编码不能为空";
            ret.code = "E1B120011";
            out.print(JSON.stringify(ret));
            return;
        }
        //按城市搜索
        var searchQueryByCity = [];
        searchQueryByCity.push({n: 'citycode', v: citycode, type: 'text'});
        var queryArgs = {
            mode: 'adv',
            q: searchQueryByCity.length > 0 ? searchQueryByCity : null
        };
        searchArgs.queryArgs = JSON.stringify(queryArgs);
        var cityResult = SearchService.search(searchArgs);
        var citytotal = cityResult.searchResult.getTotal();
        var citylist = cityResult.searchResult.getLists();
        // if(citytotal == 0){
        //     //按省搜索
        //     var searchQueryByProvince = [];
        //     searchQueryByProvince.push({n: 'provincecode', v: provincecode, type: 'text', op: "and"});
        //     var queryArgs = {
        //         mode: 'adv',
        //         q: searchQueryByProvince.length > 0 ? searchQueryByProvince : null
        //     };
        //     searchArgs.queryArgs = JSON.stringify(queryArgs);
        //     var provinceResult = SearchService.search(searchArgs);
        //     var provincetotal = provinceResult.searchResult.getTotal();
        //     var provincelist = provinceResult.searchResult.getLists();
        //     if(provincetotal == 0){
        //         var areastr = ps20.getContent("area_"+provincecode);
        //         var areaobj = JSON.parse(areastr);
        //         var areacode = areaobj.areacode;
        //         var searchQueryByArea = [];
        //         searchQueryByArea.push({n: 'areacode', v: areacode, type: 'text', op: "and"});
        //         var queryArgs = {
        //             mode: 'adv',
        //             q: searchQueryByArea.length > 0 ? searchQueryByArea : null
        //         };
        //         searchArgs.queryArgs = JSON.stringify(queryArgs);
        //         var areaResult = SearchService.search(searchArgs);
        //         var areatotal = areaResult.searchResult.getTotal();
        //         var arealist = areaResult.searchResult.getLists();
        //         if(areatotal == 0){
        //             ret.msg = "没有相关门店信息";
        //             ret.code = "E1B120009";
        //             out.print(JSON.stringify(ret));
        //             return;
        //         }else{
        //             //如果不为空，查询门店数据
        //             var returndata = UserService.getShopInfoByIds(arealist,false);
        //             ret.code = "S0A00000";
        //             ret.msg = "查询门店信息成功";
        //             ret.data = returndata.data;
        //             out.print(JSON.stringify(ret));
        //         }
        //     }else{
        //         //如果不为空，查询门店数据
        //         var returndata = UserService.getShopInfoByIds(provincelist,false);
        //         ret.code = "S0A00000";
        //         ret.msg = "查询门店信息成功";
        //         ret.data = returndata.data;
        //         out.print(JSON.stringify(ret));
        //     }
        // }else{
            //如果不为空，查询门店数据
            var returndata = UserService.getShopInfoByIds(citylist,false);
            ret.code = "S0A00000";
            ret.msg = "查询门店信息成功";
            // ret.data = returndata.data;
            var redata =[
                {shopid: "123", shopname: "天猫店"},
                {shopid: "456", shopname: "京东店"},
                {shopid: "789", shopname: "yihao店"},
                {shopid: "101", shopname: "不知道店"},
            ];
            ret.data = redata;
            out.print(JSON.stringify(ret));
        // }
    } catch (e) {
        ret.msg = "查询门店信息失败";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

