//#import Util.js
//#import md5Service.js
//#import sysArgument.js

/**
 * 添加一些通用的函数
 */
var CommonUtil = (function () {

    // var url = "http://bspoisp.sit.sf-express.com:11080/bsp-oisp/sfexpressService";
    var url = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "sf_url");
    // var checkWord = "od0Bm16iucKWa69M";
    var checkWord = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "checkWord");
    var head = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "head");
    var auto_create = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "auto_create");

    var selfApi = new JavaImporter(
        net.xinshi.isone.commons.XMLUtil
    );

    var f = {
            initRes: function () {
                return {code: ErrorCode.S0A00000.code, msg: ErrorCode.S0A00000.msg, data: ""};
            },
            /**
             * 出错时接口的返回信息
             * @param res:接口返回的信息
             * @param resCode：从ErrorCode中取
             */
            setErrCode: function (res, ErrCode, msg) {
                if (!msg) {
                    res.msg = ErrCode.msg;
                } else {
                    res.msg = msg;
                }
                res.code = ErrCode.code;
                out.print(JSON.stringify(res));
            },
            /**
             * 成功时的返回信息
             * @param res
             * @param data
             */
            setRetData: function (res, data) {
                res.data = data;
                out.print(JSON.stringify(res));
            },
            /**
             * 获取验证码
             * @param length
             * @returns {string}
             */
            getRandomCode: function (length) {
                if (!length || length == 0) {
                    length = 6;
                }
                var str = '';
                for (var i = 0; i < length; i++) {
                    str += Math.floor(Math.random() * 10);
                }
                return str;
            },
            /**
             * 获取加密的appKey
             * @returns {string}
             */
            getEncryptAppKey: function () {
                var value = ps20.getContent("appConfig_ole") + "";
                if (!value) {
                    return null;
                }
                value = JSON.parse(value);
                return value && value.appKey || "";
            },
            /**
             * 获取指定SKU的价格，返回数据约定如下：
             * marketPrice:市场价（正价）,specialPirce:特价（如果没有，为空）
             * curPrice:当前价格，hasSpecialPrice:是否有特价，membersPrices:会员价数组
             * 特价优先级最高，然后到V3 V2 V1级别的会员价,最后是普通会员价
             * @param product
             * @param skuId
             * @returns {*}
             */
            getSkuPrice: function (product, skuId, loginUserId) {

                function setPrice(price, value) {
                    price.skuId = value.skuId;
                    price.unitPrice = (Number(value.unitPrice) / 100).toFixed(2);
                    price.isSpecialPrice = value.isSpecialPrice;
                    price.moneyTypeId = value.moneyTypeId;
                }


                /**
                 * 返回对应的会员等级 －1:未登录 0：ole会员 1：V1会员 2：V2会员 3：V3会员 -2:其他会员组
                 */
                function getMemberLv(groupId) {

                    if (commonGroupId === groupId) {
                        return 4;
                    } else if (v3_groupId === groupId) {
                        return 3;
                    } else if (v2_groupId === groupId) {
                        return 2;
                    } else if (v1_groupId === groupId) {
                        return 1;
                    } else if (oleGroupId === groupId) {
                        return 0;
                    } else if ("" === groupId) {
                        return -1;
                    } else {
                        return -2; //其他用户组
                    }

                }


                var priceId = product.priceId;
                var price = priceService.getPrice(priceId);

                var curPrice = {moneyTypeId: "", skuId: "", curMemberLv: -1, unitPrice: "", isSpecialPrice: ""}; //当前用户组价格
                var retPrices = {},
                    hasSpecialPrice = false,
                    hasCurMemberPrice = false,
                    curPriceLv = -1,
                    specialPrice = {},
                    specialMsg = "",
                    marketPrice = {},
                    membersPrices = [],
                    commonGroupId = "c_101",
                    oleGroupId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_group"),
                    v1_groupId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "hrtv1_group"),
                    v2_groupId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "hrtv2_group"),
                    v3_groupId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "hrtv3_group");

                if (!price) {
                    return {curPrice:curPrice,marketPrice:marketPrice,curPriceLv:curPriceLv,specialPrice:specialPrice,membersPrices:membersPrices};
                }

                var prices = price && price.values && price.values[skuId] ? price.values[skuId] : null;
                if (prices) {  //如果存在价格对象
                    for (var key in prices) { //key是skuId
                        var values = prices[key];
                        if (key.indexOf("entitytype_usergroup_") > -1) {  //如果是用户组价格
                            var groupId = key.split("entitytype_usergroup_")[1];  //取价格的会员ID
                            if (groupId) {
                                var column = ColumnService.getColumn(groupId);
                                var memberLv = getMemberLv(groupId);
                                if (Array.isArray(values)) {
                                    for (var i = 0; i < values.length; i++) {
                                        if (values[i] && f.isEffectivePrice(values[i])) {
                                            //特价
                                            var isSpecialPrice = values[i].isSpecialPrice;
                                            if (isSpecialPrice == "Y") {

                                                    if (!hasSpecialPrice) {
                                                        hasSpecialPrice = true;
                                                        setPrice(specialPrice, values[i]);
                                                        setPrice(curPrice, values[i]);
                                                        curPrice.curMemberLv = memberLv;
                                                        curPriceLv = memberLv;
                                                    } else {
                                                        specialMsg = "该商品拥有多个有效特价，请重新设置价格";  //存在多个会员组特价则返回此条信息
                                                    }


                                            }

                                            //非特价
                                            //属于OLE会员组的价格，都返回到membersPrices中
                                            if (memberLv > -2 && values[i].isSpecialPrice == 'N') {
                                                var memberPrice = {};
                                                setPrice(memberPrice, values[i]);
                                                membersPrices.push({
                                                    memberLv: memberLv,
                                                    groupId: groupId,
                                                    groupName: column.name,
                                                    price: memberPrice
                                                });


                                                //未登录的情况： 设置memberPrices
                                                if (!loginUserId) {
                                                    if (memberLv === 4) {
                                                        setPrice(marketPrice, values[i]);
                                                        if (!hasSpecialPrice && !hasCurMemberPrice) {
                                                            setPrice(curPrice, values[i]);
                                                            curPrice.curMemberLv = memberLv;
                                                            curPriceLv = memberLv;
                                                        }
                                                    }
                                                } else {
                                                    var isCurGroup = UserService.checkMemberGroup(loginUserId, groupId);
                                                    // $.log("groupId[" + groupId + "]isCurGroup[" + isCurGroup + "]" + "memberLv[" + memberLv + "]");
                                                    if (memberLv === 4) {
                                                        setPrice(marketPrice, values[i]);
                                                        if (!hasSpecialPrice && !hasCurMemberPrice) {
                                                            setPrice(curPrice, values[i]);
                                                            curPrice.curMemberLv = memberLv;
                                                            curPriceLv = memberLv;
                                                        }
                                                    } else if (isCurGroup && curPriceLv < memberLv) {

                                                        setPrice(marketPrice, values[i]);
                                                        if (!hasSpecialPrice) {
                                                            setPrice(curPrice, values[i]);
                                                            curPrice.curMemberLv = memberLv;
                                                            curPriceLv = memberLv;
                                                            hasCurMemberPrice = true;
                                                        }
                                                    } else {
                                                    }
                                                }

                                            }
                                        }
                                    }

                                    retPrices.hasSpecialPrice = hasSpecialPrice;  //是否有特价
                                    retPrices.specialPirce = specialPrice;  //特价
                                    retPrices.specialMsg = specialMsg;
                                    retPrices.curPrice = curPrice;  //当前价格：大字的价格
                                    retPrices.membersPrices = membersPrices; //会员价数组
                                    retPrices.marketPrice = marketPrice;  //普通会员价 c_101
                                    retPrices.loginUserId = loginUserId;
                                }
                            }
                        }

                    }

                }
                return retPrices;

            },
            getVerifyCode: function (xml) {
                return Md5Service.md5EncryptAndBase64(xml + checkWord) + "";
            },
            getPostUrl: function () {
                return url;
            },
            getCreateType: function () {
                return auto_create;
            },
            getHead: function(){
                return head;
            },
            /**
             * 返回节点所有属性
             * @param data
             * @param xPath
             * @returns {*}
             */
            getAttrsToJSON: function (xmlData, xPath) {
                var jResult = selfApi.XMLUtil.getAttrsToJSON(xmlData, xPath) + "";
                return jResult ? JSON.parse(jResult) : "";
            },
            /**
             * 获取节点的Text值
             * @param xmlData
             * @param xPath
             * @returns {string}
             */
            getNodeValue: function (xmlData, xPath) {
                return selfApi.XMLUtil.getNodeValue(xmlData, xPath) + "";
            },
            /**
             * 返回NodeList的节点属性集合
             * @param xmlData
             * @param xPath
             * @returns {string}
             */
            getNodeListJSONAttrs: function (xmlData, xPath) {
                var jResult = selfApi.XMLUtil.getNodeListJSONAttrs(xmlData, xPath) + "";
                return !f.isEmptyObject(jResult) ? JSON.parse(jResult) : "";
            },
            parseSFRouteXml: function (xmlData, xPath) {
                var jResult = selfApi.XMLUtil.parseSFRouteXml(xmlData, xPath) + "";
                return !f.isEmptyObject(jResult) ? JSON.parse(jResult) : "";
            },
            /**
             * 将s的属性COPY到d
             * @param s
             * @param d
             * @returns {*}
             */
            copyParams: function (s, d) {
                for (var k in s) {
                    s[k] && (d[k] = s[k]);
                }
                return d;
            },
            isEmptyObject: function (obj) {
                var name;
                for (name in obj) {
                    return false;
                }
                return true;
            },
            /**
             * 判断某个价格是否有效
             * @param priceObj
             * @returns {boolean}
             */
            isEffectivePrice: function (priceObj) {
                if (priceObj) {
                    if (priceObj.beginDateTime && Number(priceObj.beginDateTime) > Date.now()) {
                        return false;
                    }
                    if (priceObj.endDateTime && Number(priceObj.endDateTime) < Date.now()) {
                        return false;
                    }
                    return true;
                } else {
                    return false;
                }
            },


        }
    ;
    return f;
})();