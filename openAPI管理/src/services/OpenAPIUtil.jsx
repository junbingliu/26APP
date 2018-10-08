//#import pigeon.js
//#import Util.js
//#import HttpUtil.js
//#import $openAPIManage:services/OpenAPIConfigService.jsx

var OpenAPIUtil = (function () {
    var f = {
        getApiList: function (searchParam) {
            if (!searchParam) {
                searchParam = {};
            }
            var config = f.getConfig();
            searchParam.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apiadmin/list", JSON.stringify(searchParam), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getApiLogList: function (searchParam) {
            if (!searchParam) {
                searchParam = {};
            }
            var config = f.getConfig();
            searchParam.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apilog/logs", JSON.stringify(searchParam), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getApiTokenList: function (searchParam) {
            if (!searchParam) {
                searchParam = {};
            }
            var config = f.getConfig();
            searchParam.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apitoken/list", JSON.stringify(searchParam), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getApiLog: function (id) {
            if (!id) {
                return null;
            }
            var postData = {id:id};
            var config = f.getConfig();
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apilog/get", JSON.stringify(postData), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        addApi: function (api) {
            if (!api) {
                return null;
            }
            var config = f.getConfig();
            api.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apiadmin/add", JSON.stringify(api), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getApi: function (id) {
            if (!id) {
                return null;
            }
            var postData = {id:id};
            var config = f.getConfig();
            postData.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apiadmin/get", JSON.stringify(postData), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        updateApi: function (api) {
            if (!api) {
                return null;
            }
            var config = f.getConfig();
            api.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apiadmin/update", JSON.stringify(api), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        deleteApi: function (id) {
            if (!id) {
                return null;
            }
            var postData = {id:id};
            var config = f.getConfig();
            postData.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apiadmin/delete", JSON.stringify(postData), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getChart: function (searchParam) {
            if (!searchParam) {
                searchParam = {};
            }
            var config = f.getConfig();
            searchParam.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apilog/chart", JSON.stringify(searchParam), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getConfig: function () {
            return OpenAPIConfigService.getConfig();
        },
        addApiToken: function (apiToken) {
            if (!apiToken) {
                return null;
            }
            var config = f.getConfig();
            apiToken.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apitoken/add", JSON.stringify(apiToken), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        getApiToken: function (id) {
            if (!id) {
                return null;
            }
            var postData = {id:id};
            var config = f.getConfig();
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apitoken/get", JSON.stringify(postData), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        updateApiToken: function (apiToken) {
            if (!apiToken) {
                return null;
            }
            var config = f.getConfig();
            apiToken.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apitoken/update", JSON.stringify(apiToken), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },
        deleteApiToken: function (id) {
            if (!id) {
                return null;
            }
            var postData = {id:id};
            var config = f.getConfig();
            postData.token = config && config.token || "";
            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式
            var responseRet = HttpUtils.postRaw(config.url + "/apitoken/delete", JSON.stringify(postData), headers);
            if (responseRet) {
                return JSON.parse(responseRet);
            } else {
                return null;
            }
        },

    };
    return f;
})();