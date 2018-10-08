//#import Util.js
//#import sku.js
//#import merchant.js
//#import pigeon.js

var OmsControlArgService = (function (pigeon) {
    var prefix = "omsEsbLog_sysArg";
    var defaultShipNodeObj = "omsEsbLog_sysArg_shipNodeObj";

    var f = {
        saveArgs: function (jArgs) {
            var id = f.getArgsId(jArgs.merchantId);
            jArgs.id = id;

            pigeon.saveObject(id, jArgs);
        },
        getArgs: function (merchantId) {
            var id = f.getArgsId(merchantId);
            //先取商家的参数配置
            var jArgs = pigeon.getObject(id);
            //如果商家没有配置，就取平台配置
            if (!jArgs) {
                jArgs = f.getPlatformArgs();
            }
            return jArgs;
        },
        getMerchantArgs: function (merchantId) {
            var id = f.getArgsId(merchantId);
            var jArgs = pigeon.getObject(id);
            return jArgs;
        },
        getPlatformArgs: function () {
            var id = f.getArgsId("head_merchant");
            return pigeon.getObject(id);
        },
        getArgsId: function (merchantId) {
            return prefix + "_" + merchantId;
        },
        /**
         * 转换订单里的转品信息（基准SKU与打包SKU）
         * @param jAfterOrder
         * @returns {*}
         */
        convertAfterOrderRealSkuId: function (jAfterOrder) {
            if (!jAfterOrder) {
                return jAfterOrder;
            }
            var isCrossBorder = f.isCrossBorderMerchant(jAfterOrder.merchantId);
            //因为主站的是传子码商品与子码数量，所以只有跨境才需要转换
            if (!isCrossBorder) {
                return jAfterOrder;
            }
            var jItems = jAfterOrder.items;
            for (var k in jItems) {
                var jItem = jItems[k];
                var oldRealSkuId = jItem.realSkuId;
                var oldAmount = jItem.exchangedAmount;//售后数量
                var jBaseSkuInfo = f.getBaseSkuInfo(jItem.skuId, jItem.realSkuId, isCrossBorder, oldAmount);
                jItem.realSkuId = jBaseSkuInfo.baseRealSkuId;//跨境这个要传基准SKU
                jItem.exchangedAmount = jBaseSkuInfo.baseSkuAmount;
                jItem.baseRealSkuId = oldRealSkuId;//跨境这个要传打包后的SKU，即购买的SKU
                jItem.baseSkuAmount = oldAmount;//跨境这个要传打包后的SKU数量,即购买的数量
            }
            return jAfterOrder;
        },
        convertRefundOrderRealSkuId: function (jAfterOrder) {
            if (!jAfterOrder) {
                return jAfterOrder;
            }
            var isCrossBorder = f.isCrossBorderMerchant(jAfterOrder.merchantId);
            //因为主站的是传子码商品与子码数量，所以只有跨境才需要转换
            if (!isCrossBorder) {
                return jAfterOrder;
            }
            var jItems = jAfterOrder.items;
            for (var k in jItems) {
                var jItem = jItems[k];
                var oldRealSkuId = jItem.realSkuId;
                var oldAmount = jItem.exchangedAmount;//售后数量
                var jBaseSkuInfo = f.getBaseSkuInfo(jItem.skuId, jItem.realSkuId, isCrossBorder, oldAmount);
                jItem.realSkuId = jBaseSkuInfo.baseRealSkuId;//跨境这个要传基准SKU
                jItem.exchangedAmount = jBaseSkuInfo.baseSkuAmount;
                jItem.baseRealSkuId = oldRealSkuId;//跨境这个要传打包后的SKU，即购买的SKU
                jItem.baseSkuAmount = oldAmount;//跨境这个要传打包后的SKU数量,即购买的数量
            }
            return jAfterOrder;
        },
        /**
         * 换货单转换SKU编码
         * @param jAfterOrder
         * @returns {*}
         */
        convertBarterOrderRealSkuId: function (jAfterOrder,type) {
            if (!jAfterOrder) {
                return jAfterOrder;
            }
            var isCrossBorder = f.isCrossBorderMerchant(jAfterOrder.merchantId);
            //因为主站的是传子码商品与子码数量，所以只有跨境才需要转换
            if (!isCrossBorder && (type != "ledger" || !type)) {
                return jAfterOrder;
            }
            if(type == "ledger"){
                isCrossBorder = true;//如果是冻结或释放库存,那所有的SKU都要进行转品,不管是不是跨境
            }
            var jItems = jAfterOrder.items;
            for (var k in jItems) {
                var jItem = jItems[k];
                var oldRealSkuId = jItem.realSkuId;
                var oldAmount = jItem.exchangedAmount;//售后数量
                var jBaseSkuInfo = f.getBaseSkuInfo(jItem.skuId, jItem.realSkuId, isCrossBorder, oldAmount);
                jItem.realSkuId = jBaseSkuInfo.baseRealSkuId;//跨境这个要传基准SKU
                jItem.exchangedAmount = jBaseSkuInfo.baseSkuAmount;
                jItem.baseRealSkuId = oldRealSkuId;//跨境这个要传打包后的SKU，即购买的SKU
                jItem.baseSkuAmount = oldAmount;//跨境这个要传打包后的SKU数量,即购买的数量
            }
            var jNewItems = jAfterOrder.newItems;
            if (jNewItems && jNewItems.length > 0) {
                for (var i = 0; i < jNewItems.length; i++) {
                    var jItem = jNewItems[i];
                    var oldRealSkuId = jItem.realSkuId;
                    var oldAmount = jItem.amount;//售后数量
                    var jBaseSkuInfo = f.getBaseSkuInfo(jItem.skuId, jItem.realSkuId, isCrossBorder, oldAmount);
                    jItem.realSkuId = jBaseSkuInfo.baseRealSkuId;//跨境这个要传基准SKU
                    jItem.amount = jBaseSkuInfo.baseSkuAmount;
                    jItem.baseRealSkuId = oldRealSkuId;//跨境这个要传打包后的SKU，即购买的SKU
                    jItem.baseSkuAmount = oldAmount;//跨境这个要传打包后的SKU数量,即购买的数量
                }
            }
            return jAfterOrder;
        },
        /**
         * 转换订单里的转品信息（基准SKU与打包SKU）
         * @param jOrder
         * @param type 操作的类型
         * @returns {*}
         */
        convertOrderRealSkuId: function (jOrder,type) {
            if (!jOrder) {
                return jOrder;
            }
            var isCrossBorder = f.isCrossBorderMerchant(jOrder.sellerInfo.merId);
            //因为主站的是传子码商品与子码数量，所以只有跨境才需要转换
            if (!isCrossBorder && (type != "ledger" || !type)) {
                return jOrder;
            }
            if(type == "ledger"){
                isCrossBorder = true;//如果是冻结或释放库存,那所有的SKU都要进行转品,不管是不是跨境
            }
            var jItems = jOrder.items;
            for (var k in jItems) {
                var jItem = jItems[k];
                var oldRealSkuId = jItem.realSkuId;
                var oldAmount = jItem.amount;
                var jBaseSkuInfo = f.getBaseSkuInfo(jItem.skuId, jItem.realSkuId, isCrossBorder, oldAmount);
                jItem.realSkuId = jBaseSkuInfo.baseRealSkuId;//跨境这个要传基准SKU
                jItem.amount = jBaseSkuInfo.baseSkuAmount;
                jItem.baseSkuId = oldRealSkuId;//跨境这个要传打包后的SKU，即购买的SKU
                jItem.baseAmount = oldAmount;//跨境这个要传打包后的SKU数量,即购买的数量
            }
            return jOrder;
        },
        /**
         * 获取需要对接的SkuId
         * @param skuId 内部ID
         * @param realSkuId SKU编码
         * @param isCrossBorder 是否跨境
         * @param amount 数量
         */
        getBaseSkuInfo: function (skuId, realSkuId, isCrossBorder, amount) {
            var result = {baseSkuId: skuId, baseRealSkuId: realSkuId, baseSkuAmount: amount};
            if (!skuId) {
                return result;
            }
            var jRatio = SkuService.getRatio(skuId);
            if (!jRatio) {
                return result;
            }
            //跨境对接母码商品，主站转品对接子码商品与数量
            if (!isCrossBorder) {
                return result;
            }
            var baseSkuId = jRatio.baseSkuId;
            var jSku = SkuService.getSkuBySkuIdEx(baseSkuId);
            if (!jSku) {
                return result;
            }
            result.baseSkuId = jSku.id;
            result.baseRealSkuId = jSku.skuId;
            result.baseSkuAmount = Number(amount) * Number(jRatio.ratio);
            return result;
        },
        isCrossBorderMerchant: function (merchantId) {
            var jMerchant = MerchantService.getMerchant(merchantId);
            if (!jMerchant) {
                return false;
            }
            return jMerchant.mainColumnId == "c_cross_border_merchant";
        },
        //这个是判断平台级的，是否对接ESB
        needExchangeToEsb2: function () {
            var jArgs = f.getPlatformArgs();
            if (!jArgs) {
                $.log(".....................没有配置对接参数，不对接给ESB");
                return false;
            }
            var isExchangeEsb = f.isEsbExchange(jArgs);
            if (isExchangeEsb) {
                return true;
            }
            return false;
        },
        //这个是判断平台级的,是否开启OMS对接
        needExchangeToOms2: function () {
            var jArgs = f.getPlatformArgs();
            if (!jArgs) {
                $.log(".....................没有配置对接参数，不对接给OMS");
                return false;
            }
            var isOmsExchange = f.isOmsExchange(jArgs);
            if (isOmsExchange) {
                return true;
            }
            return false;
        },
        //订单是否需要对接到ESB
        needExchangeOrderToEsb: function (jOrder, exchangeType) {
            if (!jOrder || !exchangeType) {
                return false;
            }
            var merchantId = jOrder.sellerInfo.merId;
            if (!f.needExchangeToEsb(merchantId)) {
                return false;
            }
            var states = jOrder.states;
            if (!states) {
                return false;
            }
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var needExchangeOms = f.needExchangeToOms(merchantId);//是否对接OMS
            var payType = jOrder.payType;//300线上支付,301货到付款
            var createTime = jOrder.createTime;//订单创建时间
            var processState = states.processState;//订单处理状态 p100:未确认，p101:已确认，p102：已出库，p112：已签收，p111：已取消
            var payState = states.payState;//p200未支付,p201已支付

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime > beginTime && needExchangeOms) {
                return false;
            }
            if (needExchangeOms) {
                if (exchangeType == "cancel") {
                    //如果是取消，那么未确认或者确认时间在OMS上线之后的订单不需要对接ESB,其他的都要对接（如：已确认，已出库，已签收）
                    if (!processState.p101 || (processState.p101 && processState.p101.lastModifyTime > beginTime)) {
                        return false;
                    }
                    return true;
                } else if (exchangeType == "update") {
                    //如果是修改订单，那么未确认或者确认时间在OMS上线之后的订单不需要对接ESB,其他的都要对接（如：已确认，已出库，已签收）
                    if (!processState.p101 || (processState.p101 && processState.p101.lastModifyTime > beginTime)) {
                        return false;
                    }
                    return true;
                } else if (exchangeType == "add") {
                    return false;
                }
            } else {
                return true;
            }

            return false;
        },
        //售后退货单、换货单是否需要对接到ESB
        needExchangeAfterOrderToEsb: function (jAfterOrder, exchangeType) {
            if (!jAfterOrder || !exchangeType) {
                return false;
            }
            var merchantId = jAfterOrder.sellerInfo.merId;
            if (!f.needExchangeToEsb(merchantId)) {
                return false;
            }
            var states = jAfterOrder.states;
            if (!states) {
                return false;
            }
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var needExchangeOms = f.needExchangeToOms(merchantId);//是否对接OMS

            var createTime = jAfterOrder.createTime;//订单创建时间
            var approveState = states.approveState;//审核状态 state_1:已审核，state_0:待审核,state_2:已取消,state_3:无需退货
            var warehousingState = states.warehousingState;//审核状态 Warehousing_N:未入库，Warehousing_Y:已入库

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime > beginTime && needExchangeOms) {
                return false;
            }
            if (needExchangeOms) {
                if (exchangeType == "cancel") {
                    //如果是取消，那么未审核通过的售后单不需要对接ESB
                    if (!approveState.state_1) {
                        return false;
                    }
                    return true;
                } else if (exchangeType == "add") {
                    return false;
                }
            } else {
                return true;
            }

            return false;
        },
        //售后退款单是否需要对接到ESB
        needExchangeRefundOrderToEsb: function (jRefundOrder, exchangeType) {
            if (!jRefundOrder || !exchangeType) {
                return false;
            }
            var merchantId = jRefundOrder.merchantId;
            if (!f.needExchangeToEsb(merchantId)) {
                return false;
            }
            var states = jRefundOrder.states;
            if (!states) {
                return false;
            }
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var needExchangeOms = f.needExchangeToOms(merchantId);//是否对接OMS

            var createTime = jRefundOrder.createTime;//订单创建时间
            var refundState = states.refundState;//退款状态 Refund_0:未退款，Refund_1:已退款,Refund_2:部分退款,Refund_3:无需退款,Refund_4:退款中,Refund_5:退款失败

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime > beginTime && needExchangeOms) {
                return false;
            }
            if (needExchangeOms) {
                //如果是已退款完成的并且退款完成时间要小于OMS接口上线时间，才需要对接（其实实际上是不会有这种情况出现，因为一退款完成就会退接给ESB的）
                //所以实际上启用了OMS之后，就不需要对接给ESB了
                if (exchangeType == "add" && refundState.state == "Refund_1" && refundState.lastModifyTime < beginTime) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }

            return false;
        },
        //订单是否需要对接到Oms
        needExchangeOrderToOms: function (jOrder, exchangeType) {
            if (!jOrder || !exchangeType) {
                return false;
            }
            var merchantId = jOrder.sellerInfo.merId;
            if (!f.needExchangeToOms(merchantId)) {
                return false;
            }
            var states = jOrder.states;
            if (!states) {
                return false;
            }
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var createTime = jOrder.createTime;//订单创建时间
            var processState = states.processState;//订单处理状态 p100:未确认，p101:已确认，p102：已出库，p112：已签收，p111：已取消
            var payState = states.payState;//p200未支付,p201已支付

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime >= beginTime) {
                return true;
            }
            if (exchangeType == "cancel") {
                //如果是取消，那么未支付未确认的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
                if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            } else if (exchangeType == "update") {
                //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
                if (((payState.state == "p200" && processState.state == "p100") && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            } else if (exchangeType == "lock") {
                //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
                if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            } else if (exchangeType == "release") {
                //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
                if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            } else if (exchangeType == "add") {
                if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            }

            return false;
        },
        //售后退货单、换货单是否需要对接到ESB
        needExchangeAfterOrderToOms: function (jAfterOrder, exchangeType) {
            if (!jAfterOrder || !exchangeType) {
                return false;
            }
            var merchantId = jAfterOrder.sellerInfo.merId;
            if (!f.needExchangeToOms(merchantId)) {
                return false;
            }
            var states = jAfterOrder.states;
            if (!states) {
                return false;
            }
            var afterType = jAfterOrder.orderType;//barterProduct:换货,returnProduct:退货
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var needExchangeEsb = f.needExchangeToEsb(merchantId);//是否对接OMS

            var createTime = jAfterOrder.createTime;//订单创建时间
            var approveState = states.approveState;//审核状态 state_1:已审核，state_0:待审核,state_2:已取消,state_3:无需退货
            var warehousingState = states.warehousingState;//审核状态 Warehousing_N:未入库，Warehousing_Y:已入库

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime > beginTime) {
                return true;
            }
            if (exchangeType == "cancel") {
                //如果是取消，那么未审核和审核时间在启用时间之前的就不需要对接
                if (approveState.state == "state_0" || (approveState.state_1 && approveState.state_1.lastModifyTime < beginTime)) {
                    return false;
                }
                return true;
            } else if (exchangeType == "add") {
                //如果是新增，那么在审核的时候要对接到OMS，但是要对shipNode做特殊处理
                return true;
            } else if (exchangeType == "lock") {
                //如果是换货单冻结库存，那么要判断换货单的创建时间是不是在oms上线之前，如果是在OMS上线之前创建的订单，那就不调用冻结接口
                if (createTime < beginTime) {
                    return false;
                }
                return false;
            }

            return false;
        },
        //售后拒收退货单是否需要对接到OMS
        needExchangeRejectAfterOrderToOms: function (merchantId, exchangeType) {
            if (!merchantId || !exchangeType) {
                return false;
            }
            if (!f.needExchangeToOms(merchantId)) {
                return false;
            }

            return true;
        },
        //售后退款单是否需要对接到OMS
        needExchangeRefundOrderToOms: function (jRefundOrder, exchangeType) {
            if (!jRefundOrder || !exchangeType) {
                return false;
            }
            var merchantId = jRefundOrder.merchantId;
            if (!f.needExchangeToOms(merchantId)) {
                return false;
            }
            var states = jRefundOrder.states;
            if (!states) {
                return false;
            }
            var beginTime = f.getBeginTime("", merchantId);//接口上线时间
            var needExchangeOms = f.needExchangeToOms(merchantId);//是否对接OMS

            var createTime = jRefundOrder.createTime;//订单创建时间
            var refundState = states.refundState;//退款状态 Refund_0:未退款，Refund_1:已退款,Refund_2:部分退款,Refund_3:无需退款,Refund_4:退款中,Refund_5:退款失败

            //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
            if (createTime > beginTime) {
                return true;
            }
            if (needExchangeOms) {
                //只要是退款单完成的都需要对接给OMS,不需要判断退款单创建时间了
                if (exchangeType == "add" && refundState.state == "Refund_1") {
                    return true;
                }
            } else {
                return false;
            }

            return false;
        },
        //先根据商家判断，商家没有配置，就取平台的配置
        needExchangeToEsb: function (merchantId) {
            if (!merchantId) {
                return false;
            }
            var jArgs = f.getArgs(merchantId);
            if (!jArgs) {
                jArgs = f.getPlatformArgs();
            }
            if (!jArgs) {
                $.log(".....................没有配置对接参数，不对接给ESB");
                return false;
            }
            var isExchangeEsb = f.isEsbExchange(jArgs);
            //启用ESB 否，不对接
            if (!isExchangeEsb) {
                return false;
            }
            return true;
        },
        needExchangeToOms: function (merchantId) {
            if (!merchantId) {
                return false;
            }
            var jArgs = f.getArgs(merchantId);
            if (!jArgs) {
                $.log(".....................商家" + merchantId + "和平台都没有配置对接参数，不对接给OMS");
                return false;
            }
            var isOmsExchange = f.isOmsExchange(jArgs);
            if (!isOmsExchange) {
                return false;
            }
            return true;
        },
        /**
         * 获取接口上线时间
         * @param jArgs 参数对象
         * @param merchantId 商家Id
         * @returns {*}
         */
        getBeginTime: function (jArgs, merchantId) {
            //如果没有传参数，但是传了商家ID，就取商家的参数
            if (!jArgs && merchantId) {
                jArgs = f.getArgs(merchantId);
            }
            //如果没有传商家Id，并且没有传参数或者商家参数取不到，就取平台参数
            if (!merchantId && !jArgs) {
                jArgs = f.getPlatformArgs();
            }
            var beginTime = f.getArgValueByKeyExt(jArgs, "beginTime");//接口上线时间
            return beginTime;
        },
        isEsbExchange: function (jArgs) {
            var isEsbExchange = f.getArgValueByKeyExt(jArgs, "isEsbExchange");
            if (isEsbExchange && isEsbExchange == "Y") {
                return true;
            }
            return false;
        },
        isOmsExchange: function (jArgs) {
            var isOmsExchange = f.getArgValueByKeyExt(jArgs, "isOmsExchange");
            if (isOmsExchange && isOmsExchange == "Y") {
                return true;
            }
            return false;
        },
        getArgValueByKey: function (valueKey) {
            var jArgs = f.getArgs();
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        },
        getArgValueByKeyExt: function (jArgs, valueKey) {
            if (!jArgs) {
                return "";
            }

            var value = jArgs[valueKey];
            if (!value) {
                return "";
            }

            return value;
        },
        getDefaultShipNodeObj: function () {
            return pigeon.getObject(defaultShipNodeObj);
        },
        getDefaultShipNode: function (merchantId) {
            var shipNodeObj = f.getDefaultShipNodeObj();
            if (!shipNodeObj) {
                return null;
            }
            return shipNodeObj[merchantId];
        },
        saveShipNode: function (merchantId, shipNode) {
            if(!merchantId){
                return;
            }
            var shipNodeObj = f.getDefaultShipNodeObj();
            if (!shipNodeObj) {
                shipNodeObj = {};
            }
            shipNodeObj[merchantId] = shipNode;
            pigeon.saveObject(defaultShipNodeObj, shipNodeObj)
        },
        /**
         * 获取OMS的ESB对接地址
         * @returns {*}
         */
        getOmsEsbUrl: function () {
            return f.getArgValueByKey("omsEsbUrl");
        }
    };
    return f;
})($S);