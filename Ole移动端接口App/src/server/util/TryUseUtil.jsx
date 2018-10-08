//#import Util.js
//#import cart.js
//#import sku.js
//#import user.js
//#import order.js
//#import login.js
//#import delivery.js
//#import merchant.js
//#import address.js
//#import normalBuy.js
//#import sysArgument.js

var TryUseUtil = function () {
    var f = {
        /**
         * 生成试用订单
         * @param userId 会员id
         * @param productId 商品Id
         * @param activityId 活动Id
         * @param deliveryFee 运费
         * @param maxUseIntegral 能使用多少积分
         * @param unitPrice 商品价格
         * @returns {{state: string, msg: string}}
         */
        addTryUseOrder: function (userId, productId, activityId, deliveryFee, maxUseIntegral, unitPrice) {
            var ret = {state: 'err', msg: ''};
            if (!userId || !productId || !activityId || (!deliveryFee && deliveryFee != "0")) {
                ret.msg = "参数不能为空";
                return ret;
            }
            var orderId = f.getOrderId(userId, activityId);
            if (orderId) {
                ret.msg = "已经生成了试用订单：" + orderId + ",不能重复生成";
                return ret;
            }
            var jUser = UserService.getUser(userId);
            if (!jUser) {
                ret.msg = "会员Id错误，取不到对应的会员：" + userId;
                return ret;
            }
            var jProduct = ProductService.getProduct(productId);
            if (!jProduct) {
                ret.msg = "商品Id错误，取不到对应的商品：" + productId;
                return ret;
            }
            var states = f.getB2COrderState();//订单状态
            var jOrder = {};

            //买家信息
            var buyerInfo = {
                loginId: jUser.loginId || "",
                userId: jUser.id || "",
                realName: jUser.realName || ""
            };
            var merchantId = jProduct.merchantId;
            var jMerchant = MerchantService.getMerchant(merchantId);
            if (!jMerchant) {
                ret.msg = "商家Id错误，取不到对应的商家：" + merchantId;
                return ret;
            }
            //买家信息
            var sellerInfo = {
                merName: jMerchant.name_cn,
                merId: jMerchant.objId
            };

            var deliveryInfo = f.getB2CDeliveryInfo(jUser);//配送信息
            var deliveryInfoExt = {
                deliveryTimeKey: 'everyday',
                deliveryTime: '工作日、周末及假日均可送货',
                description: ""//买家订单备注
            };//配送时间等

            var totalPayPrice = Number(unitPrice) + Number(deliveryFee);
            var priceInfo = f.getB2CPriceInfo(unitPrice, deliveryFee);//订单信息

            var payRecs = f.getB2CPayRecs(totalPayPrice);//支付信息

            var invoiceInfo = f.getB2CInvoiceInfo();//发票信息

            var useCardInfo = {
                couponsInfo: []
            };//会员使用的卡信息

            var giveCardInfo = {
                couponsInfo: []
            };//送券信息

            var logisticsInfo = {};//物流商信息

            var priceRateInfo = {
                RMB2INTEGRALRate: ''
            };//积分与人民币兑换信息

            var creatorInfo = {
                loginId: jUser.loginId || "",
                userId: userId,
                realName: jUser.realName || ""
            };//创建人信息

            var description = {};//订单备注
            var deliveryPoint = {};//自提点

            var itemResult = f.getB2CItems(productId, unitPrice);//订单商品行
            if (itemResult.state == "ok") {
                jOrder.items = itemResult.items;
            } else {
                ret.msg = itemResult.msg;
                return ret;
            }

            jOrder.buyerInfo = buyerInfo;
            jOrder.sellerInfo = sellerInfo;
            jOrder.priceInfo = priceInfo;
            jOrder.states = states;
            jOrder.deliveryInfo = deliveryInfo;
            jOrder.deliveryInfoExt = deliveryInfoExt;
            jOrder.invoiceInfo = invoiceInfo;
            jOrder.logisticsInfo = logisticsInfo;
            jOrder.creatorInfo = creatorInfo;
            jOrder.priceRateInfo = priceRateInfo;
            jOrder.useCardInfo = useCardInfo;
            jOrder.giveCardInfo = giveCardInfo;
            jOrder.description = description;
            jOrder.deliveryPoint = deliveryPoint;
            jOrder.payRecs = payRecs;

            jOrder.merchantId = jMerchant.objId;
            jOrder.orderType = "tryuse";
            jOrder.orderSource = "front";
            jOrder.payType = "300";//线上支付
            jOrder.moneyTypeId = "moneytype_RMB";
            jOrder.targetMoneyTypeId = "moneytype_RMB";
            jOrder.moneyTypeName = "RMB";
            jOrder.ruleResults = [];
            jOrder.tryuseActivityId = activityId;//试用活动id
            jOrder.maxUseIntegral = maxUseIntegral || 0;//最多能使用多少积分

            if (deliveryFee == 0) {
                jOrder.states.processState.state = "p101";
                jOrder.states.payState.state = "p201";
                jOrder.states.payState["p201"] = {
                    lastModifyUserId: "u_0",
                    lastModifyTime: new Date().getTime() + ''
                };
                jOrder.states.processState["p101"] = {
                    lastModifyUserId: "u_0",
                    lastModifyTime: new Date().getTime() + ''
                };
                jOrder.payRecs = {};
            }
            var addRet = f.addB2COrder(jOrder);
            if (addRet.state == 'ok') {
                f.addKey(userId, activityId, addRet.aliasCode);
            }
            ret.state = addRet.state;
            ret.msg = addRet.msg;
            ret.aliasCode = addRet.aliasCode || "";
            return ret;
        },
        getB2COrderKey: function (userId, activityId) {
            return "tryuser_b2c_" + userId + "_" + activityId;
        },
        addKey: function (userId, activityId, aliasCode) {
            var obj = {orderAliasCode: aliasCode};
            ps20.saveContent(f.getB2COrderKey(userId, activityId), JSON.stringify(obj));
        },
        getOrderId: function (userId, activityId) {
            var p = ps20.getContent(f.getB2COrderKey(userId, activityId));
            if (!p || p == "null") {
                return null;
            } else {
                var obj = JSON.parse(p);
                return obj.orderAliasCode;
            }
        },
        addB2COrder: function (jB2COrder) {
            var ret = {state: 'err', msg: ''};
            var tryuseActivityId = jB2COrder.tryuseActivityId;
            var lockKey = "add_order_" + tryuseActivityId + "_" + jB2COrder.buyerInfo.userId;
            try {
                //加锁，防止重复生成b2c订单
                ps20.lock(lockKey);
                var b2cOrderId = OrderService.addOrder(jB2COrder, jB2COrder.orderType, jB2COrder.buyerInfo.userId);
                var jOrder = OrderService.getOrder(b2cOrderId);
                if (jOrder) {
                    ret.state = "ok";
                    ret.aliasCode = jOrder.aliasCode;
                }
            } catch (e) {
                ret.msg = e + "";
                $.log("...................生成试用订单出错:" + e);
            } finally {
                //解除锁定
                ps20.unlock(lockKey);
            }
            return ret;
        },
        /**
         * 获取b2c支付信息
         * @param deliveryFee
         * @returns {*}
         */
        getB2CPayRecs: function (deliveryFee) {
            var payRecs = {};
            var paymentId = "";
            var paymentName = "在线支付";
            var payState = "0";
            var payStateName = "未支付";
            payRecs['1'] = {
                paymentName: paymentName,
                payMoneyAmount: 0,
                fPayMoneyAmount: "0.00",
                needPayMoneyAmount: f.toInteger(deliveryFee),
                fNeedPayMoneyAmount: f.toFix(deliveryFee),
                moneyAmount: f.toInteger(deliveryFee),
                fMoneyAmount: f.toFix(deliveryFee),
                paymentId: paymentId || "",
                state: payState,
                stateName: payStateName,
                payInterfaceId: "payi_1"
            };
            return payRecs;
        },
        //订单价格信息
        getB2CPriceInfo: function (o_goods_total_price, deliveryFee) {
            var o_total_price = Number(o_goods_total_price) + Number(deliveryFee);//商品金额 +运费
            var priceInfo = {
                totalOrderSupplyPrice: 0,
                fTotalOrderSupplyPrice: '0.00',
                cardPayPrice: 0,
                fCardPayPrice: '0.00',
                totalDepositPrice: 0,
                fTotalDepositPrice: '0.00',
                categorySufRebatePreferPrice: 0,
                fCategorySufRebatePreferPrice: '0.00',
                integralBuyPrice: 0,
                fIntegralBuyPrice: '0.00',
                ticketPayPrice: 0,
                fTicketPayPrice: 0,
                totalOrderPrice: f.toInteger(o_total_price),//订单成交价
                fTotalOrderPrice: f.toFix(o_total_price),
                totalOrderRealPrice: f.toInteger(o_total_price),//订单成交价
                fTotalOrderRealPrice: f.toFix(o_total_price),
                totalProductPrice: f.toInteger(o_goods_total_price),//商品成交价格
                fTotalProductPrice: f.toFix(o_goods_total_price),
                totalDeliveryPrice: f.toInteger(deliveryFee || 0),//运费
                fTotalDeliveryPrice: f.toFix(deliveryFee || 0),
                deliveryProductPreferPrice: 0,
                fDeliveryProductPreferPrice: "0.00",
                totalOrderPayPrice: 0,//已支付金额
                fTotalOrderPayPrice: "0.00",
                totalTaxPrice: 0,
                fTotalTaxPrice: '0.00',
                totalBalancePrice: 0,
                fTotalBalancePrice: '0.00',
                totalOrderPreferPrice: 0,//订单优惠金额
                fTotalOrderPreferPrice: "0.00",
                orderPreferPrice: 0,
                fOrderPreferPrice: '0.00',
                totalOrderNeedPayPrice: f.toInteger(o_total_price),//订单还需要支付的金额
                fTotalOrderNeedPayPrice: f.toFix(o_total_price)
            };//价格信息
            return priceInfo;
        },
        //发票信息
        getB2CInvoiceInfo: function () {
            var invoiceInfo = {
                invoiceTitleType: '个人',
                invoiceType: '普通',
                invoiceDescription: '',
                invoiceTitle: '',
                invoiceTypeKey: 'com',
                needInvoice: '不需要',
                needInvoiceKey: 'no',
                invoiceContent: ''
            };//发票信息
            return invoiceInfo;
        },
        //收货人信息
        getB2CDeliveryInfo: function (jUser, deliveryFee) {
            if (!jUser) {
                return null;
            }
            var jAddress = AddressService.getDefaultAddress(jUser.id);
            var deliveryInfo = {
                postalCode: '',
                totalDeliveryPrice: deliveryFee || "0",
                phone: jAddress && jAddress.phone || "",
                mobile: jAddress && jAddress.mobile || "",
                regionId: jAddress && jAddress.regionId || "",
                deliveryRuleDescription: '',
                regionPath: jAddress && jAddress.regionName || "",
                addressId: jAddress && jAddress.id || "",
                address: jAddress && jAddress.address || "",
                deliveryRuleId: jAddress && jAddress.selectedDeliveryRuleId || "",
                deliveryRuleName: '',
                deliveryWayId: '',
                deliveryWayCode: '',
                deliveryWayName: '',
                userName: jAddress && jAddress.userName || "",
                deliveryRule: {}
            };//配送信息
            var deliveryRuleId = f.getDeliveryRuleId();
            if (deliveryRuleId) {
                var deliveryRule = DeliveryService.getDeliveryRule(deliveryRuleId);
                if (deliveryRule) {
                    deliveryInfo.deliveryRule = deliveryRule;
                    deliveryInfo.deliveryRuleDescription = deliveryRule.calculateDescription;
                    deliveryInfo.deliveryRuleId = deliveryRule.id;
                    deliveryInfo.deliveryRuleName = deliveryRule.name;
                    deliveryInfo.deliveryWayId = deliveryRule.deliveryWayId;
                    deliveryInfo.deliveryWayCode = '';
                    deliveryInfo.deliveryWayName = deliveryRule.deliveryWayName;
                }
            }
            return deliveryInfo;
        },
        //订单状态
        getB2COrderState: function () {
            var b2cProcessState = f.getB2COrderProcessState();//处理状态，未确认
            var b2cPayState = f.getB2COrderPayState();//支付状态，未支付
            var nowTime = new Date().getTime();
            var states = {
                processState: {
                    state: b2cProcessState,
                    lastModifyUserId: "u_0",
                    lastModifyTime: nowTime
                },//处理状态
                payState: {
                    state: b2cPayState,//支付状态
                    lastModifyUserId: "u_0",
                    endPayTime: '',
                    lastModifyTime: nowTime
                },
                refundState: {
                    state: "p300"//未退款
                },
                approvalState: {
                    state: "a100"//已审核
                }
            };//状态
            //处理状态
            states.processState[b2cProcessState] = {
                lastModifyUserId: "u_0",
                lastModifyTime: nowTime
            };
            //支付状态
            states.payState[b2cPayState] = {
                lastModifyUserId: "u_0",
                lastModifyTime: nowTime
            };
            return states;
        },
        //订单处理状态
        getB2COrderProcessState: function () {
            return "p100";//p100 未确认，101 已确认
        },
        //订单支付状态
        getB2COrderPayState: function (hrtOrderPayState) {
            return "p200";//p200 未支付，p201 已支付
        },
        /**
         *  生成b2c的订单items
         * @param productId 商品Id
         * @param unitPrice 商品价格
         * @returns {{state: string, msg: string}}
         */
        getB2CItems: function (productId, unitPrice) {
            var ret = {state: 'err', msg: ''};
            if (!productId) {
                ret.msg = "商品Id为空";
                return ret;
            }
            var b2cItems = {};
            var jProduct = ProductService.getProduct(productId);
            if (!jProduct) {
                ret.msg = "取不到" + productId + "对应的商品";
                return ret;
            }
            var jSku = SkuService.getHeadSkuByProductId(jProduct.objId);
            if (!jSku) {
                ret.msg = "取不到" + productId + "对应的默认SKU";
                return ret;
            }

            var b2cItem = {};
            b2cItem.isNeedDelivery = "1";//是否需要配送，写死
            b2cItem.amount = 1;//数量
            b2cItem.title = jProduct.name;//商品名称
            b2cItem.name = jProduct.name;//商品名称
            b2cItem.warehouseType = "01";//干货，冷仓？
            b2cItem.objAmount = 0;//

            b2cItem.itemId = f.getNewB2CItemId();//itemId，cartItem_50000
            b2cItem.productId = jProduct.objId;//商品ID
            b2cItem.realSkuId = jSku.skuId;//SKU编码
            b2cItem.categoryId = jProduct.columnId;//栏目ID
            b2cItem.brandId = jProduct.brandColumnId;//品牌ID
            b2cItem.skuId = jSku.id;//SKU内部ID
            b2cItem.taxRate = 0;//

            b2cItem.moneyTypeId = "moneytype_RMB";//价格类型
            b2cItem.moneyTypeName = "RMB ";//价格类型名称
            b2cItem.sellUnitName = jProduct.sellUnitName;//销售单位
            b2cItem.attrs = {};//规格

            var totalPrice = unitPrice * b2cItem.amount;//交易总价 单价*数量
            var priceInfo = {
                unitPrice: f.toInteger(unitPrice),
                fUnitPrice: f.toFix(unitPrice),
                totalPrice: f.toInteger(totalPrice),
                fTotalPrice: f.toFix(totalPrice),
                fTaxPrice: '0.00',
                taxPrice: 0,
                fTotalTaxPrice: '0.00',
                totalTaxPrice: 0,
                erpUnitPrice: 0,
                fErpUnitPrice: '0.00',
                integralPrice: 0,
                fIntegralPrice: '0.00',
                supplyPrice: 0,
                fSupplyPrice: '0.00',
                integralRMBPrice: 0,
                fIntegralRMBPrice: '0.00',
                totalIntegralRMBPrice: 0,
                fTotalIntegralRMBPrice: '0.00',
                giveOrderPreferPrice: 0,//订单优惠金额
                fGiveOrderPreferPrice: '0.00',//订单优惠金额
                originalUnitPrice: f.toInteger(unitPrice),
                fOriginalUnitPrice: f.toFix(unitPrice)//原价 = 成交价 + 优惠价
            };
            if (!ret.msg) {
                ret.state = "ok";
            }
            b2cItem.priceInfo = priceInfo;
            b2cItems[b2cItem.itemId] = b2cItem;
            ret.items = b2cItems;
            return ret;
        },
        /**
         * 获取b2c新的itemId
         * @returns {string}
         */
        getNewB2CItemId: function () {
            return "cartItem_" + ps20.getId("cartItem");
        },
        /**
         * 四舍五入2位小数
         * @param value
         * @returns {*}
         */
        toFix: function (value) {
            if (isNaN(value)) {
                return value;
            }
            //return Number(value).toFixed(2);//这个方法有个时候不会四舍五入，如0.015不会四舍五入到0.02
            return Math.round(Number(value) * Math.pow(10, 2)) / Math.pow(10, 2);
        },
        /**
         * 从元转化成分
         * @param value
         * @returns {*}
         */
        toInteger: function (value) {
            if (isNaN(value)) {
                return value;
            }
            return Number((Number(value) * 100).toFixed(0));
        },
        //获取试用订单默认配送规则id
        getDeliveryRuleId: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "tryuse_deliveryRuleId");
        }
    };
    return f;
}();