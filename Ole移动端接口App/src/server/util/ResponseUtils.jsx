/**
 * Response工具类
 * by fuxiao
 * @email fuxiao9@crv.com.cn
 * @date 2017-07-31
 */

;
var ResponseUtil = (function () {
    var f = {};
    /**
     * 返回结果函数
     * @param code 返回代码
     * @param msg 返回消息
     * @param data 返回数据
     */
    f.setResultInfo = function (code, msg, data) {

        // 设置返回格式
        response.setContentType("application/json");

        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    };

    f.success = function (data) {
        f.setResultInfo("S0A00000", "success", data)
    };

    f.error = function (errorMessage) {
        f.setResultInfo("E1B0001", errorMessage)
    };
    return f;
})();
