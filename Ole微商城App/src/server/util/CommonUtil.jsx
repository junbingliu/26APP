var CommonUtil = {
    initRes: function () {
        return {code: ErrorCode.S0A00000.code, msg: ErrorCode.S0A00000.msg, data: ""};
    },
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

        /**
         * 判断某个价格是否有效
         * @param priceObj
         * @returns {boolean}
         */
        function isEffectivePrice(priceObj) {
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
                                if (values[i] && isEffectivePrice(values[i])) {
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