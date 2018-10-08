//#import Util.js
//#import user.js
//#import product.js
//#import merchant.js
//#import @server/util/MathUtil.jsx

/**
 * pos 对接工具类，包含与pos对接相关接口，如：购物车调用pos接口取价格与促销信息
 * @type {{refreshCartPrice: refreshCartPrice}}
 */
var PosUtil = function () {
    var f = {
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
                        numberid: realSkuId,//商品编码
                        memberid: jUser.memberid || ""//会员id
                    };
                    //查询促销商品信息
                    var resultObj = ProductService.getPromotionGoodInfo(param);
                    var status = resultObj.status;
                    if (status != "0") {
                        //对于没有取到价格信息的商品，直接跳过，以线上价格为准
                        totalProductPrice = accAdd(jItem.totalPrice, totalProductPrice);
                        continue;
                    }
                    var retobj = resultObj.data;
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
                $.log(".............PosUtil.jsx 刷新购物车价格出现异常，异常信息:" + e);
            }
        }
    };
    return f;
}();