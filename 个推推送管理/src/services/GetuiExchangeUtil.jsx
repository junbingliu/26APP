//#import Util.js
//#import DateUtil.js
//#import HttpUtil.js
//#import encryptUtil.js
//#import search.js
//#import $getui:services/GetuiArgService.jsx
//#import $getui:services/GetuiService.jsx
//#import $ewjEKD:services/UserAdminService.jsx
//#import $ewjEKD:pages/search/UserAdminQuery.jsx

var GetuiExchangeUtil = (function () {
    var f = {
        msgType: {
            picking: 'picking',
            delivery: 'delivery'
        },
        setTag: function (jUser) {
            if (!jUser) {
                return null;
            }
            var belongToShopId = jUser.belongToShopId;//所属门店
            var userRole = jUser.userRole;//会员类型
            var tag = belongToShopId + "_" + userRole;

            var postData = {
                cid: jUser.clientId,
                tag_list: [tag]
            };

            if (userRole == "distributionType") {
                var result = GetuiExchangeUtil.postToGT(postData, "set_tags", GetuiExchangeUtil.msgType.delivery);
            } else {
                var result = GetuiExchangeUtil.postToGT(postData, "set_tags", GetuiExchangeUtil.msgType.picking);
            }
            if (result.state == "ok" && result.returnData.result == "ok") {
                jUser.tag = tag;
                UserAdminService.updateUserAdmin(jUser);
            }
            return result;
        },
        getPickingPostData: function (jOrder) {
            var merchantId = jOrder.sellerInfo.merId;
            var jArgs = GetuiArgService.getArgs(merchantId);
            var content = {
                title: '您有一个新的订单可以抢拣货',
                content: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode,
                time: DateUtil.getLongDate(DateUtil.getNowTime())
            };
            var tag = merchantId + "_pickingType";//配送的tag
            var beginTime = DateUtil.getLongDate(DateUtil.getNowTime());
            var endTime = DateUtil.getLongDate(new Date().getTime() + 20 * 60 * 1000);//20分钟
            var postData = {
                message: {appkey: jArgs.appKey2, is_offline: false, msgtype: 'transmission'},
                notification: {
                    text: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode,
                    title: '您有一个新的订单可以抢拣货',
                    transmission_type: true,
                    transmission_content: '您有一个新的订单可以抢拣货，订单号：' + jOrder.aliasCode,
                    duration_begin: beginTime,
                    duration_end: endTime
                },
                transmission: {
                    transmission_type: false,
                    transmission_content: JSON.stringify(content),
                    duration_begin: beginTime,
                    duration_end: endTime
                },
                condition: [{
                    key: 'tag',
                    values: [tag],
                    opt_type: 1
                }],
                requestid: f.getRequestId()
            };
            return postData;
        },
        getDeliveryPostData: function (jOrder) {
            if (!jOrder) {
                return null;
            }
            var merchantId = jOrder.sellerInfo.merId;
            var jArgs = GetuiArgService.getArgs(merchantId);
            var content = {
                title: '您有一个新的订单可以抢配送',
                content: '您有一个新的订单可以抢配送，订单号：' + jOrder.aliasCode,
                time: DateUtil.getLongDate(DateUtil.getNowTime())
            };
            var tag = merchantId + "_distributionType";
            var beginTime = DateUtil.getLongDate(DateUtil.getNowTime());
            var endTime = DateUtil.getLongDate(new Date().getTime() + 20 * 60 * 1000);//20分钟
            var postData = {
                message: {appkey: jArgs.appKey, is_offline: false, msgtype: 'transmission'},
                notification: {
                    text: '您有一个新的订单可以抢配送，订单号：' + jOrder.aliasCode,
                    title: '您有一个新的订单可以抢配送',
                    transmission_type: true,
                    transmission_content: '您有一个新的订单可以抢配送，订单号：' + jOrder.aliasCode,
                    duration_begin: beginTime,
                    duration_end: endTime
                },
                transmission: {
                    transmission_type: false,
                    transmission_content: JSON.stringify(content),
                    duration_begin: beginTime,
                    duration_end: endTime
                },
                condition: [{
                    key: 'tag',
                    values: [tag],
                    opt_type: 1
                }],
                requestid: f.getRequestId()
            };
            return postData;
        },
        getExchangeUrl: function (type, appId) {
            if (!type || !appId) {
                return null;
            }
            var url = "https://restapi.getui.com/v1/" + appId + "/";
            if (type == "auth_sign") {
                url += "auth_sign/";
            } else if (type == "auth_close") {
                url += "auth_close/";
            } else if (type == "push_single") {
                url += "push_single/";
            } else if (type == "save_list_body") {
                url += "save_list_body/";
            } else if (type == "push_list") {
                url += "push_list/";
            } else if (type == "push_app") {
                url += "push_app/";
            } else if (type == "stop_task") {
                url += "stop_task/";
            } else if (type == "push_single_batch") {
                url += "push_single_batch/";
            } else if (type == "bind_alias") {
                url += "bind_alias/";
            } else if (type == "unbind_alias") {
                url += "unbind_alias/";
            } else if (type == "set_tags") {
                url += "set_tags/";
            } else if (type == "push_result") {
                url += "push_result/";
            }
            return url;
        },
        /**
         * 对接
         * @param postData 对接的数据
         * @param type 对接的接口类型,如：push_app
         * @param msgType 消息类型，如：picking,delivery，拣货和配送
         */
        postToGT: function (postData, type, msgType) {
            var ret = {state: 'err', msg: '', returnData: {}};
            var merchantId = postData.merchantId;
            var jArgs = f.getArg(merchantId);
            delete postData.merchantId;
            if (msgType == "picking") {
                jArgs.appId = jArgs.appId2;
                jArgs.appKey = jArgs.appKey2;
                jArgs.appSecret = jArgs.appSecret2;
                jArgs.masterSecret = jArgs.masterSecret2;
            }

            var headers = {};
            headers['Content-Type'] = 'application/json;charset=utf-8';//设置请求格式

            var sign = f.getSign(jArgs, postData.timestamp);//获取签名
            if (type == "auth_sign") {
                postData.sign = sign;
            } else {
                var authToken = GetuiService.getAuthToken(msgType);
                if (!authToken) {
                    authToken = f.refreshAuthToken(jArgs, msgType);
                }
                if (!authToken) {
                    ret.msg = "获取auth_token失败";
                    return ret;
                }
                headers['authtoken'] = authToken;
            }

            var url = f.getExchangeUrl(type, jArgs.appId);
            var result = HttpUtils.postRaw(f.getExchangeUrl(type, jArgs.appId), JSON.stringify(postData), headers);
            if (result) {
                try {
                    var jsonResult = JSON.parse(result);
                    ret.returnData = jsonResult;
                    if (jsonResult.result == "ok") {
                        ret.state = "ok";
                    } else {
                        ret.msg = jsonResult.msg;
                    }
                } catch (e) {
                    ret.returnData = result;
                }
            } else {
                ret.msg = "对接失败,没有返回信息";
            }
            ret.postData = postData;
            f.addExchangeLog(ret, merchantId, type);
            return ret;
        },
        refreshAuthToken: function (jArgs, msgType) {
            var postData = {
                timestamp: DateUtil.getNowTime(),
                appkey: jArgs.appKey
            };
            var result = GetuiExchangeUtil.postToGT(postData, "auth_sign", msgType);
            if (result.state == "ok") {
                var token = result.returnData.auth_token;
                GetuiService.saveAuthToken(token, new Date().getTime(), msgType);
                return token;
            } else {
                return null;
            }
        },
        getSign: function (jArgs, time) {
            var str = jArgs.appKey + time + jArgs.masterSecret;
            return EncryptUtil.sha256Encrypt(str);
        },
        /**
         * 增加对接日志
         * @param result 对接返回结果
         * @param merchantId 商家ID
         * @param type type
         */
        addExchangeLog: function (result, merchantId, type) {
            if (!result || !type) {
                return;
            }
            if (!merchantId) {
                merchantId = "head_merchant";
            }
            var returnData = result.returnData;
            var respone_code = returnData.result;//代码 S0A00000成功

            if (result.state == "ok") {
                GetuiService.addLog(merchantId, type, '', respone_code, "对接成功：" + respone_code, result.postData, result.returnData);
            } else {
                GetuiService.addLog(merchantId, type, '', 'ERROR', "对接失败：" + respone_code, result.postData, result.returnData);
            }
        },
        getArg: function (merchantId) {
            merchantId = "head_merchant";
            var jArgs = GetuiArgService.getArgs(merchantId);
            if (!jArgs) {
                return null;
            }
            return jArgs;
        },
        /**
         * 获取拣货员配送员的clientId集合
         * @param shopId 门店ID
         * @param roleType 角色类型 distributionType pickingType
         * @param start 开始数量
         * @param limit 取多少条
         * @returns {Array}
         */
        getUserClientIds: function (shopId, roleType, start, limit) {
            var searchParams = {
                belongToShopId: shopId || "",
                userRole: roleType || "",
                state: "1"
            };
            if (!start) {
                start = 0;
            }
            if (!limit) {
                limit = 100;
            }
            //进入搜索
            var searchArgs = {
                fetchCount: limit,
                fromPath: start
            };
            searchArgs.sortFields = [{
                field: "createTime",
                type: 'LONG',
                reverse: true
            }];

            searchArgs.queryArgs = UserAdminQuery.getQueryArgs(searchParams);
            var result = SearchService.search(searchArgs);
            var total = result.searchResult.getTotal();
            $.log('................total:' + total);
            var ids = result.searchResult.getLists();
            var clientIds = [];
            for (var i = 0; i < ids.size(); i++) {
                var objId = ids.get(i);
                var record = UserAdminService.getById(objId);
                if (record && record.clientId) {
                    clientIds.push(record.clientId);
                }
            }
            return clientIds;
        },
        getRequestId: function () {
            var requestId = "";
            var curDate = DateUtil.getLongDate(DateUtil.getNowTime());
            curDate = curDate.replace(/-/g, '');
            curDate = curDate.replace(/:/g, '');
            curDate = curDate.replace(/ /g, '');
            requestId += curDate;
            for (var i = 0; i < 6; i++) {
                requestId += Math.floor(Math.random() * 10);
            }
            return requestId;
        }
    };
    return f;
})();