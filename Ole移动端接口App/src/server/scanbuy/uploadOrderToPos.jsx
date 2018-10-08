//#import Util.js
//#import product.js
//#import login.js
//#import session.js
//#import user.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = {
        code: 'E1B120006',
        msg: ""
    };
    try {

        var aliasCode = $.params.aliasCode;//订单外部号
        var paramobj = {
            aliasCode:aliasCode
        }
        //上传订单流水
        var resultObj = ProductService.uploadOrderToPosOnBack(paramobj);
        var status = resultObj.status;
        if(status == "0"){;
            ret.code = "S0A00000";
            ret.msg = "订单上传成功";
            out.print(JSON.stringify(ret));
        }else{
            ret.code = "E1B120009";
            ret.msg = resultObj.msg;
            out.print(JSON.stringify(ret));
            return;
        }
    } catch (e) {
        $.log("error info="+e);
        ret.msg = "订单上传失败";
        ret.code = "E1B120008";
        out.print(JSON.stringify(ret));
    }

})();

