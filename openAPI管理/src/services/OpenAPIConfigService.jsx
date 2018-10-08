//#import pigeon.js
//#import Util.js

var OpenAPIConfigService = (function (pigeon) {
    var prefix = "open_api";//ID前缀，在meta.json里定义
    var f = {
        /**
         * 构造数据
         * @param param
         * @returns {f}
         */
        apiConfig: function (param) {
            var data = param || {};
            var self = this;
            self.id = data.id;
            self.token = data.token || "";
            self.url = data.url || "";
            self.lastModifiedTime = new Date().getTime();
            self.createTime = data.createTime;
            if (!data.createTime) {
                self.createTime = new Date().getTime();
            }
            return self;
        },
        /**
         * 增加对象，保存数据
         * @param param
         * @returns {*}
         */
        save: function (param) {
            param = f.apiConfig(param);//构造数据
            param.id = f.getConfigId();
            var key = pigeon.getRevertComparableString(param.createTime, 13);
            pigeon.saveObject(param.id, param);//保存对象
            return param.id;
        },
        getConfigId: function () {
            return prefix + "_config";
        },
        getConfig: function () {
            var v = pigeon.getObject(f.getConfigId());
            if (v) {
                return v;
            } else {
                return null;
            }
        }
    };
    return f;
})($S);