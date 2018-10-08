//#import Util.js
//#import login.js
//#import user.js
//#import DateUtil.js
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

        var now = new Date();


        setResultInfo("S0A00000", "success",{"currentTime":now.getTime()});


    } catch (e) {
        $.error("查询门店信息失败" + e);
        setResultInfo("E1B0001333","查询门店信息失败" + e);
    }
})();