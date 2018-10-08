//#import Util.js
//#import login.js
//#import user.js
//#import $oleMobileApi:services/OleShoppingBagService.jsx
;(function () {
    /**获取购物袋列表信息接口
     *
     * @param code
     * @param msg
     * @param data
     * wupeng
     */
    //返回函数
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }


    try {
        $.log("\n\n 扫码购购物袋查询   = "  + "\n\n");
        var data = OleShoppingBagService.findAllList();
        $.log("\n\n 扫码购购物袋查询 data.length  = " + data.length + "\n\n");
       // $.log("\n\n 扫码购购物袋查询 data  = " + JSON.parse(data) + "\n\n");
        setResultInfo("S0A00000", "success", {list : data,total : data.length});




    } catch (e) {
        $.error("查询购物袋信息失败" + e);
        setResultInfo("E1B0001333","查询购物袋信息失败" + e);
    }
})();