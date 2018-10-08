//#import Util.js
//#import user.js
//#import crvpos.js
//#import merchant.js
//#import @server/util/MathUtil.jsx

/**
 * pos 对接工具类，包含与pos对接相关接口，如：购物车调用pos接口取价格与促销信息
 * @type {{refreshCartPrice: refreshCartPrice}}
 */
var PosService = function (pigeon) {
    var prefix = "pos_";
    var f = {
        /**
         * 保存从线下获取到的价格信息
         * @param param
         * @param result
         */
        savePrice: function (param, result) {
            if (!param || !result) {
                return;
            }
            var obj = {
                shopId: param.shopid,
                numberId: param.numberid,
                levelId: param.levelid,
                time: new Date().getTime(),
                data: result
            };
            pigeon.saveObject(f.getId(param), obj);
        },
        /**
         * 获取之前从线下获取的价格价格，如果没有，就重新从线下获取
         * 如果有直接用原来的，如果时间超过5分钟了，也重新获取
         * @param param
         */
        getPrice: function (param) {
            if (!param) {
                return null;
            }
            var id = f.getId(param);
            var obj = pigeon.getObject(id);
            //这里是判断5分钟内有效,加快访问速度，也防止信息更新不及时
            if (obj && obj.time > (new Date().getTime() - 5 * 60 * 1000)) {
                return obj.data;
            }
            //查询促销商品信息
            var resultObj = CRVPosService.getPosGoodInfo(param);
            var status = resultObj.status;//状态为0表示成功
            if (status != "0") {
                return null;
            }
            f.savePrice(param, resultObj.data);
            return resultObj.data;//线下返回的信息
        },
        getId: function (param) {
            return prefix + param.shopid + "_" + param.numberid + "_" + param.levelid;
        },
        /**
         * 刷新购物车商品价格和总成交价格
         * @param carts 购物车列表
         * @param userId 会员ID
         */
        refreshCartPrice: function (carts, userId) {
            try {
                if (!carts || carts.length == 0) {
                    return;
                }
                var jUser = UserService.getUser(userId + "");
                if (!jUser) {
                    return;
                }
                var jCart = carts[0];//只取第一个购物车，判断购物车类型，只有common的购物车才刷新价格
                if (jCart.cartType != 'common') {
                    $.log("...............购物类型不是common，不刷新价格,cartType:" + jCart.cartType);
                    return;
                }
                var buyItems = jCart.buyItems;
                if (!buyItems || buyItems.length == 0) {
                    $.log("...............没有商品，不刷新价格");
                    return;
                }
                var memberLevel = jUser.memberLevel;//会员等级
                var level = -1;
                if (memberLevel == "hrtv1") {
                    level = 1;
                } else if (memberLevel == "hrtv2") {
                    level = 2;
                } else if (memberLevel == "hrtv3") {
                    level = 3;
                } else if (memberLevel == "ole") {
                    level = 0;
                }
                var merchantId = jCart.merchantId;//商家ID
                var jMerchant = MerchantService.getMerchant(merchantId);
                if (!jMerchant) {
                    $.log(".............取不到对应的商家");
                    return;
                }
                var shopId = jMerchant.merchantCode;//商家编码

                var totalProductPrice = 0;
                for (var i = 0; i < buyItems.length; i++) {
                    var jItem = buyItems[i];
                    var realSkuId = jItem.realSkuId;
                    var param = {
                        shopid: shopId,//门店Id
                        levelid: level,//会员等级
                        numberid: realSkuId//商品编码
                        // memberid: jUser.memberid || ""//会员id
                    };
                    //查询促销商品信息
                    var retobj = f.getPrice(param);
                    if (!retobj) {
                        //对于没有取到价格信息的商品，直接跳过，以线上价格为准
                        totalProductPrice = accAdd(jItem.totalPrice, totalProductPrice);
                        continue;
                    }
                    var price = retobj.price;//商品单价
                    var item_value = retobj.item_value;//商品销售金额
                    var disc_value = retobj.disc_value;//折扣金额
                    var v_type = retobj.v_type;//业务类型（等于8，pos端传入价格为准，其他以ERP维护价格为准）
                    var p_type = retobj.p_type;//促销类型 n不参加促销
                    jItem.unitPrice = price;
                    jItem.totalPrice = accMul(price, jItem.number);
                    jItem.totalPayPrice = accMul(price, jItem.number);
                    jItem.discountPrice = disc_value;
                    jItem.promotionType = p_type;
                    totalProductPrice = accAdd(jItem.totalPrice, totalProductPrice);
                }
                var diffPrice = totalProductPrice - jCart.totalOrderProductPrice;
                if (diffPrice != 0) {
                    jCart.totalPayPrice = accAdd(jCart.totalPayPrice, diffPrice);//总支付金额
                    jCart.finalPayAmount = accAdd(jCart.finalPayAmount, diffPrice);//最后需支付金额，含运费
                    jCart.totalOrderProductPrice = accAdd(jCart.totalOrderProductPrice, diffPrice);//订单商品金额
                }
            } catch (e) {
                $.log(".............PosService.jsx 刷新购物车价格出现异常，异常信息:" + e);
            }
        },
        /**
         * 获取订单应付金额，在获取订单确认页数据之前要调用这个api将价格刷新
         * @param carts
         * @param userId
         */
        getOrderNeedPayMoney: function (carts, userId) {
            try {
                if (!carts || carts.length == 0) {
                    return;
                }
                var jUser = UserService.getUser(userId + "");
                if (!jUser) {
                    return;
                }
                var jCart = carts[0];//只取第一个购物车，判断购物车类型，只有common的购物车才刷新价格
                if (jCart.cartType != 'common') {
                    $.log("...............购物类型不是common，不刷新价格,cartType:" + jCart.cartType);
                    return;
                }
                var buyItems = jCart.buyItems;
                if (!buyItems || buyItems.length == 0) {
                    $.log("...............没有商品，不刷新价格");
                    return;
                }
                var memberLevel = jUser.memberLevel;//会员等级
                var level = -1;
                if (memberLevel == "hrtv1") {
                    level = 1;
                } else if (memberLevel == "hrtv2") {
                    level = 2;
                } else if (memberLevel == "hrtv3") {
                    level = 3;
                } else if (memberLevel == "ole") {
                    level = 0;
                }
                var merchantId = jCart.merchantId;//商家ID
                var jMerchant = MerchantService.getMerchant(merchantId);
                if (!jMerchant) {
                    $.log(".............取不到对应的商家");
                    return;
                }
                var shopId = jMerchant.merchantCode;//商家编码
                var param = {
                    shopid: shopId,
                    posid: "",
                    sheetid: "",
                    memberid: jUser.memberid || "",
                    levelid: level
                };
                var goodsList = [];

                var totalProductPrice = 0;
                for (var i = 0; i < buyItems.length; i++) {
                    var jItem = buyItems[i];
                    var realSkuId = jItem.realSkuId;
                    var priceParam = {
                        shopid: shopId,//门店Id
                        levelid: level,//会员等级
                        numberid: realSkuId//商品编码
                        // memberid: jUser.memberid || ""//会员id
                    };
                    //查询促销商品信息
                    var retobj = f.getPrice(priceParam);
                    if (!retobj) {
                        //对于没有取到价格信息的商品，直接跳过，以线上价格为准
                        totalProductPrice = accAdd(jItem.totalPrice, totalProductPrice);
                        continue;
                    }
                    var goodsObj = retobj;
                    goodsObj.use_goodsno = realSkuId;
                    goodsList.push(goodsObj);

                    /*
                    var price = retobj.price;//商品单价
                    var item_value = retobj.item_value;//商品销售金额
                    var disc_value = retobj.disc_value;//折扣金额
                    var v_type = retobj.v_type;//业务类型（等于8，pos端传入价格为准，其他以ERP维护价格为准）
                    var p_type = retobj.p_type;//促销类型 n不参加促销
                    jItem.unitPrice = price;
                    jItem.totalPrice = accMul(price, jItem.number);
                    jItem.totalPayPrice = accMul(price, jItem.number);
                    jItem.discountPrice = disc_value;
                    jItem.promotionType = p_type;
                    totalProductPrice = accAdd(jItem.totalPrice, totalProductPrice);*/
                }
                param.goodslist = goodsList;
                var ret = CRVPosService.getOrderNeedPayMoney(param);
                $.log(".................ret:" + JSON.stringify(ret));
                /*var diffPrice = totalProductPrice - jCart.totalOrderProductPrice;
                if (diffPrice != 0) {
                    jCart.totalPayPrice = accAdd(jCart.totalPayPrice, diffPrice);//总支付金额
                    jCart.finalPayAmount = accAdd(jCart.finalPayAmount, diffPrice);//最后需支付金额，含运费
                    jCart.totalOrderProductPrice = accAdd(jCart.totalOrderProductPrice, diffPrice);//订单商品金额
                }*/
            } catch (e) {
                $.log(".............PosService.jsx 刷新购物车价格出现异常，异常信息:" + e);
            }
        },
        /**
         * 获取券动态码
         * @param cardNo 卡号
         * @param unionId 会员的unionId
         */
        getDynaCode: function (cardNo, unionId) {
            if (!cardNo || !unionId) {
                return null;
            }
            var param = {
                channel: "2",//来源渠道,1=门店,2=微信,3=电商,4=支付宝,5=微信支付,6=OLEAPP
                unionid: unionId,
                cpid: cardNo,
                quantity: 1//只获取一个动态码
            };
            var jRet = CRVPosService.getDynaCode(param);
            $.log("................PosService.jsx 获取券动态码返回结果：" + JSON.stringify(jRet));
            if (jRet && jRet.state == "ok") {
                var dynaCodeList = jRet.dynamicCodeList;
                return dynaCodeList[0].dynamicCode;
            } else {
                return null;
            }
        },
        /**
         * 获取线下pos销售单信息
         * @param listNo 流水号
         * @param posId pos机号
         * @param shopId 门店Id
         * @param time 时间戳
         */
        getPosInfo: function (listNo, posId, shopId, time) {
            if (!listNo || !shopId) {
                return null;
            }
            var param = {
                posid: posId,
                shopid: shopId,//门店
                listno: listNo,//pos流水号
                saledate: time,//时间戳
            };
            var jRet = CRVPosService.getPosInfo(param);
            $.log("................PosService.jsx 获取线下pos销售单信息返回结果：" + JSON.stringify(jRet));
            if (jRet && jRet.state == "ok") {
                return jRet.data;
            } else {
                return null;
            }
        }
    };
    return f;
}($S);