var H5CommonUtil = {
    /**
     * 设置返回值
     * @param errorCode 错误代码
     * @param data 返回数据
     * @param code 返回代码，可以不填，默认使用errorCode里的code
     * @param msg 返回的信息，可以不填，默认使用errorCode里的msg
     */
    setReturnResult: function (errorCode, data, code, msg) {
        if (!errorCode) {
            return null;
        }
        var ret = {
            code: code || errorCode.code,
            msg: msg || errorCode.msg,
            data: data || null
        };
        out.print(JSON.stringify(ret));
    },
    /**
     * 返回成功的响应信息
     * @param data
     */
    setSuccessResult: function (data) {
        var ret = {
            code: 'S0A00000',
            msg: '操作成功',
            data: data || null
        };
        out.print(JSON.stringify(ret));
    },
    /**
     * 设置返回值
     * @param errorCode 错误代码
     * @param code 返回代码，可以不填，默认使用errorCode里的code
     * @param msg 返回的信息，可以不填，默认使用errorCode里的msg
     */
    setErrorResult: function (errorCode, code, msg) {
        if (!errorCode) {
            out.print(JSON.stringify({code:"E1M000002",msg:"系统异常，请稍候重试"}));
            return;
        }
        var ret = {
            code: code || errorCode.code,
            msg: msg || errorCode.msg,
            data: null
        };
        out.print(JSON.stringify(ret));
    },
    /**
     * 异常信息时，可以将这个结果返回给前端
     * @param msg
     */
    setExceptionResult: function (msg) {
        var ret = {
            code: 'E1M000002',
            msg: msg || "系统异常，请稍候重试"
        };
        out.print(JSON.stringify(ret));
    },
    setLoginErrorResult: function (msg) {
        var ret = {
            code: 'E1M000003',
            msg: msg || "请先登录"
        };
        out.print(JSON.stringify(ret));
    },
    /**
     * 获取用来des加密的key
     * @returns {*}
     */
    getEncryptAppKey: function () {
        var value = ps20.getContent("appConfig_ole") + "";
        if (!value) {
            return null;
        }
        value = JSON.parse(value);
        return value.appKey || "";
    },
    /**
     * 获取随机几位随机数
     * @param len
     * @returns {string}
     */
    getRanString: function (len) {
        var str = "";
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        for (var i = 0; i < len; i++) {
            var pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    },
    getOleMerchantId: function () {
        return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");
    }
};