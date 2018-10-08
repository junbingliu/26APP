//#import Util.js
//#import login.js
//#import $oleMemberClassSetting:services/StoreService.jsx

(function () {

    var result = {};
    try {
        var handle = $.params.handle;

        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId) {
            result.status = 404;
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }
        if (handle == "add") {

            var data = {};
            data.merchantCode = $.params.merchantCode;
            data.name = $.params.name;
            var province = $.params.province;
            var city = $.params.city;
            if (city == "请选择市") {
                city = "";
            }else{
                city = city.split(",")[1];
            }
            if (province == "请选择省份") {
                province = "";
            }else{
                province = province.split(",")[1]+"-";
            }
            data.provinceCity= province+city;
            data.address= $.params.address;
            data.phone = $.params.phone;
            data.position = $.params.position;
            data.status = !($.params.status)? 0 : 1;
            StoreService.addStore(data,loginUserId);

        }else if (handle == "edit") {
            var obj = StoreService.getStore($.params.id);
            obj.name = $.params.name;
            var province = $.params.province;
            var city = $.params.city;
            if (city == "请选择市") {
                city = "";
            }/*else{
                city = city.split(",")[1];
            }*/
            if (province == "请选择省份") {
                province = "";
            }else{
                province = province.split(",")[1]+"-";
            }
            obj.provinceCity= province+city;
            obj.address= $.params.address;
            obj.phone = $.params.phone;
            obj.position = $.params.position;
            StoreService.updateStore(obj);
        }
        result.status = 200;
        out.print(JSON.stringify(result));

    }catch (e) {
        result.status = 500;
        result.msg = e;
        out.print(JSON.stringify(result));
    }

})();



