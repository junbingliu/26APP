//#import Util.js
//#import cart.js
//#import product.js
//#import login.js
//#import normalBuy.js
//#import file.js
//#import user.js
//#import merchant.js
//#import PreSale.js
//#import DateUtil.js
//#import sysArgument.js
//#import inventory.js
//#import @server/util/OcConverter.jsx
//#import @server/util/ErrorCode.jsx
//#import $combiproduct:services/CombiProductService.jsx

;
var CartUtil = (function () {
    var Api = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.shoppingcart,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.modules.order,
        Packages.org.json,
        Packages.net.xinshi.isone.modules.businessruleEx.plan,
        Packages.net.xinshi.isone.functions.shopping,
        Packages.net.xinshi.isone.modules.businessruleEx.plan.bean.executeTimeBean,
        Packages.net.xinshi.isone.modules.order.bean
    );
    var f = {
        addToCart: function (productId, skuId, amount, uid, spec) {
            var ret = ErrorCode.S0A00000;
            try {
                if (uid == "") {
                    uid = "-1";
                }
                var cartType = "common";
                var rule = PreSaleService.getProductPreSaleRule(productId);//判断当前商品是否处于预售状态
                var nowTime = DateUtil.getNowTime();//现在时间
                if (rule && rule.approveState == "1" && rule.depositEndLongTime > nowTime) {
                    cartType = "preSale";
                }
                if (cartType == "preSale") {
                    ret = f.addPreSaleToCart(productId, skuId, amount, uid, spec);
                    ret.cartType = cartType;
                    return ret;
                }
                if (productId.indexOf("combiProduct") > -1) {
                    //这是组合商品
                    var combiProduct = CombiProductService.getCombiProduct(productId);
                    var merchantId = combiProduct.merchantId;
                    //计算总价

                    var priceRec = CombiProductService.getPrice(combiProduct, uid);
                    CombiProductService.distributePrice(combiProduct, priceRec);
                    var icon = "";
                    if (combiProduct.fileIds && combiProduct.fileIds.length > 0) {
                        icon = FileService.getRelatedUrl(combiProduct.fileIds[0], spec);
                    }
                    var item = {
                        merchantId: merchantId,
                        cartType: "common",
                        productId: productId,
                        productVersionId: "hd",
                        skuId: "hd",
                        realSkuId: "",
                        amount: amount,
                        checked: true,
                        isCombiProduct: true,
                        combiProductId: productId,
                        productName: combiProduct.title,
                        icon: icon,
                        totalPrice: combiProduct.totalPrice,
                        unitPrice: combiProduct.totalPrice,
                        columnIds: combiProduct.columnIds,
                        resellerId: "",
                        subItems: []
                    };
                    for (var idxItems = 0; idxItems < combiProduct.productItems.length; idxItems++) {
                        var productItem = combiProduct.productItems[idxItems];
                        var product = ProductService.getProduct(productItem.productId);
                        merchantId = product.merchantId;
                        var productVersionId = product["_v"];
                        skuId = "";
                        if (productItem.skuIds && productItem.skuIds.length > 0) {
                            skuId = productItem.skuIds[0];
                        }
                        var skus = ProductService.getSkus(productItem.productId);
                        var realSkuId = "";

                        if (!skuId) {
                            if (skus.length != 1) {
                                //下面有多款商品，需要选择一款具体的商品
                                ret = ErrorCode.cart.E1M050093;
                                return ret;
                            }
                            skuId = "" + skus[0].id;
                            realSkuId = "" + skus[0].skuId;
                        }
                        else {
                            skus.forEach(function (sku) {
                                if (sku.id == skuId) {
                                    realSkuId = "" + sku.skuId;
                                }
                            });
                        }

                        var unitWeight = 0;
                        if (!isNaN(product.weight)) {
                            unitWeight = Number(product.weight) * 1000;
                        }

                        var unitVolume = 0;
                        if (!isNaN(product.volume)) {
                            unitVolume = Number(product.volume) * 1000;
                        }

                        var subItem = {
                            merchantId: merchantId,
                            cartType: "common",
                            productId: productItem.productId,
                            productName: product.name,
                            productVersionId: productVersionId,
                            skuId: skuId,
                            realSkuId: realSkuId,
                            amount: productItem.num,
                            checked: true,
                            isCombiProduct: true,
                            combiProductId: productId,
                            unitPrice: productItem.unitPrice,
                            totalPrice: productItem.totalPrice,
                            unitWeight: unitWeight,
                            unitVolume: unitVolume,
                            temperatureControl: product.temperatureControl,
                            warehouseType: product.warehouseType
                        };
                        item.subItems.push(subItem);
                    }

                    var jsonItem = $.JSONObject(item);
                    var jsonSubProducts = jsonItem.optJSONArray("subItems");
                    var jShoppingCart = Api.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
                    Api.ShoppingCartUtil.addItem(jShoppingCart, jsonItem);

                    //遍历shoppingcart 检查combiProduct,看看数量够不够
                    for (var i = 0; i < item.subItems.length; i++) {
                        var subItem = item.subItems[i];
                        var buyAmount = Api.ShoppingCartUtil.getAmountInCart(subItem.productId, subItem.skuId, merchantId, jShoppingCart, "common");
                        var sellableCount = Api.OrderItemHelper.getCommonSkuInvAmount(subItem.productId, subItem.skuId);
                        if (buyAmount > sellableCount) {
                            var product = ProductService.getProduct(subItem.productId);
                            ret = {
                                code: ErrorCode.cart.E1M050094.code,
                                msg: "'" + product.name + "'" + ErrorCode.cart.E1M050094.msg
                            };
                            return ret;
                        }
                    }

                    Api.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);
                } else {
                    var product = ProductService.getProduct(productId);
                    if (!product) {
                        return ErrorCode.cart.E1M050092;
                    }
                    var merchantId = product.merchantId;
                    if (!f.isOleMerchant(merchantId)) {
                        return ErrorCode.cart.E1M050104;
                    }
                    NormalBuyFlowService.addToCart(productId, skuId, amount, uid, merchantId, false, null, null, "");
                }
                ret.cartType = cartType;
                return ret;
            } catch (e) {
                if (e.state == 'noInventory') {
                    ret = {code: ErrorCode.cart.E1M050094.code, msg: product.name + ErrorCode.cart.E1M050094.msg};
                    return ret;
                } else {
                    var msg = "";
                    if (e && e.msg) {
                        msg = e.msg;
                    } else {
                        try {
                            msg = e.getMessage();
                        } catch (err) {
                            msg = e.toString();
                            var msgs = msg.split(":");
                            if (msgs.length > 2) {
                                msg = msgs[2];
                            }
                        }
                    }
                    ret = {code: ErrorCode.cart.E1M050095.code, msg: product && product.name + msg};
                    return ret;
                }
            }
        },
        addPreSaleToCart: function (productId, skuId, amount, uid, spec) {
            var ret = ErrorCode.S0A00000;
            if (!productId) {
                ret = ErrorCode.E1M000000;
                return ret;
            }
            var rule = PreSaleService.getProductPreSaleRule(productId);
            if (!rule) {
                ret = ErrorCode.cart.E1M050096;
                return ret;
            }
            //增加预售状态判断，如果未审核通过的预售规则，不能购买
            if (rule.approveState == "0" || rule.approveState == "-1") {
                ret = ErrorCode.cart.E1M050103;
                return ret;
            }
            var nowTime = DateUtil.getNowTime();//现在时间

            var depositEndLongTime = rule.depositEndLongTime;//定金结束支付时间
            var beginLongTime = rule.beginLongTime;//尾款开始支付时间
            var endLongTime = rule.endLongTime;//尾款结束支付时间

            var preSaleState = "0";//默认为0,表示还没开始支付定金
            if (nowTime > depositEndLongTime) {
                preSaleState = "2";//预售定金结束支付时间已过,定金支付时间已过
                ret = ErrorCode.cart.E1M050101;
                return ret;
            }
            if (nowTime > beginLongTime) {
                preSaleState = "3";//预售尾款开始支付时间已过
                ret = ErrorCode.cart.E1M050099;
                return ret;
            }
            if (nowTime > endLongTime) {
                preSaleState = "4";//预售尾款结束支付时间已过,尾款支付时间已过
                ret = ErrorCode.cart.E1M050100;
                return ret;
            }
            ret.preSaleState = preSaleState;
            //1.如果skuId == null,则检查productId是否是没有颜色尺码的区别的商品
            var realSkuId = "";
            var skus = ProductService.getSkus(productId);
            if (!skuId) {
                var effctiveSku = [];
                skus.forEach(function (sku) {
                    if (sku.isShow == "1") {
                        effctiveSku.push(sku);
                    }
                });
                if (effctiveSku.length != 1) {
                    //下面有多款商品，需要选择一款具体的商品
                    ret = ErrorCode.cart.E1M050093;
                    return ret;
                }
                skuId = "" + skus[0].id;
                realSkuId = "" + skus[0].skuId;
            } else {
                skus.forEach(function (sku) {
                    if (sku.id == skuId) {
                        realSkuId = "" + sku.skuId;
                    }
                });
            }
            //2.检查库存
            var sellCount = Api.OrderItemHelper.getSkuInventoryAmount(productId, skuId);
            if (sellCount < amount) {
                ret = ErrorCode.cart.E1M050094;
                return ret;
            }

            var product = ProductService.getProduct(productId);
            if (!f.isOleMerchant(product.merchantId)) {
                return ErrorCode.cart.E1M050104;
            }
            var productVersionId = product["_v"];
            var publishState = ProductService.getPublishState(product);
            var isCanBeBuy = "" + ProductService.checkBuyStatus(product);
            if (isCanBeBuy != "") {
                ret = ErrorCode.cart.E1M050097;
                return ret;
            }
            if (publishState == '0') {
                ret = ErrorCode.cart.E1M050098;
                return ret;
            }
            var bigCart = CartService.getBigCart();
            CartUtil.unCheckCartByType(bigCart, "common");//将普通购物车不选中
            CartService.updateBigCart(bigCart);//保存购物车

            //TODO:检查购物车中的数量，看看加起来是否有库存
            var jShoppingCart = Api.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
            var jItem = new Api.JSONObject();
            jItem.put("merchantId", product.merchantId);
            jItem.put("cartType", "preSale");
            jItem.put("objType", "preSale");
            jItem.put("productId", productId);
            jItem.put("productVersionId", productVersionId);
            jItem.put("skuId", skuId);
            jItem.put("realSkuId", realSkuId);
            jItem.put("amount", amount);
            jItem.put("checked", "true");
            jItem.put("cardBatchId", product["cardBatchId"]);
            jItem.put("isVirtual", product["isVirtual"]);
            //如果现在还没有开始支付定金，那么就不能选中去结算
            if (preSaleState == "0") {
                jItem.put("checked", "false");
            }
            Api.ShoppingCartUtil.addItem(jShoppingCart, jItem);
            Api.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);
            if (product && product.temperatureControl) {
                CartUtil.unCheckByTemperatureControl(bigCart, "preSale", product.temperatureControl);//根据温控属性，将购物车全部反选
            }
            return ret;
        },
        getCart: function (merchantId, spec) {
            if (!merchantId) {
                merchantId = f.getOleMerchantId();
            }
            var ret = ErrorCode.S0A00000;
            var t1 = new Date().getTime();
            var userId = LoginService.getFrontendUserId();
            var t2 = new Date().getTime();

            var bigCart = CartService.getNativeBigCart(false);
            if (!bigCart) {
                ret.data = {};
                return ret;
            }
            bigCart = f.checkPreSaleSate(bigCart);
            var t3 = new Date().getTime();

            var t4 = new Date().getTime();

            if (!spec)spec = "202X218";
            bigCart.put("spec", spec);
            //在购物车中需要将checked和非checked的都拿出来
            var ocs = CartService.getOcsFromBigCart(userId, bigCart, "common", false);
            if (!ocs) {
                ret.data = {};
                return ret;
            }
            //$.log(".................ocs:"+ocs);
            var t5 = new Date().getTime();
            var carts = [];
            for (var i = 0; i < ocs.size(); i++) {
                var oc = ocs.get(i);
                //只显示指定商家的购物车
                if ("" + oc.getMerchantId() != merchantId) {
                    continue;
                }
                var cart = convertOcToCart(oc);
                if (cart.buyItems) {
                    cart.buyItems.forEach(function (item) {
                        var columnIds = item.columnIds;
                        if (columnIds) {
                            item.columnIds = columnIds.split(",");
                        } else {
                            item.columnIds = [item.columnId];
                        }
                        if (item.productId.indexOf("combiProduct_") != -1) {
                            var combiProduct = CombiProductService.getCombiProduct(item.productId);
                            item.icon = FileService.getRelatedUrl(combiProduct.fileIds[0], "120X90");
                        }
                        if (item.unitPrice) {
                            item.unitPrice = Number(item.unitPrice).toFixed(2);
                        }
                        if (item.objType == "preSale") {
                            var preSaleRule = PreSaleService.getProductPreSaleRule(item.productId);
                            if (preSaleRule) {
                                item.depositBeginTime = preSaleRule.depositBeginTime;//支付开始支付时间
                                item.depositEndTime = preSaleRule.depositEndTime;//支付结束支付时间
                                item.balanceBeginTime = preSaleRule.beginTime;//尾款开始支付时间
                                item.balanceEndTime = preSaleRule.endTime;//尾款结束支付时间
                                item.preSaleType = preSaleRule.type;//预售类型，1，先定金，后尾款，2，先定金，尾款按人数确认，3，全款

                                var bookAmountKey = item.productId + "_bookAmount";
                                try {
                                    item.bookAmount = ps20.getAtom(bookAmountKey) || preSaleRule.displayAmount;
                                } catch (e) {
                                    item.bookAmount = preSaleRule.displayAmount;
                                }
                            }
                        }
                        //单笔限购
                        var prefix = "limitBuy";
                        var data = ps20.getContent(prefix + "_" + item.productId);
                        if (data) {
                            data = JSON.parse(data);
                        }
                        var config = data || {minNumber: "-1", maxNumber: "-1", userGroupId: ""};

                        var checkMemberGroup = UserService.checkMemberGroup(userId, config.userGroupId);
                        if (!checkMemberGroup) {
                            config = {minNumber: "-1", maxNumber: "-1", userGroupId: ""};  //如果不属于限购的用户组
                        }
                        item.minNumber = config && config.minNumber;
                        item.maxNumber = config && config.maxNumber;
                    });
                }
                carts.push(cart);
            }

            var t6 = new Date().getTime();
            ret.data = {
                userId: userId,
                time: (t6 - t1),
                getOcsTime: (t5 - t4),
                convertTime: (t6 - t5),
                getCartTime: (t3 - t2),
                getUserTime: (t2 - t1),
                carts: f.convertSmallCart(carts)
                //carts: carts
            };
            return ret;
        },
        getCountInCart: function (merchantId, cartType) {
            if (!merchantId) {
                merchantId = CartUtil.getOleMerchantId();
            }
            var carts = CartService.getCarts();
            var num = 0;
            carts.forEach(function (cart) {
                if (merchantId && cart.merchantId != merchantId) {
                    return;
                }
                if (cartType && cart.cartType != cartType) {
                    return;
                }
                if (cart && cart.items) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        num += new Number(item.amount);
                    }
                }
            });
            return num;
        },
        checkCartByType: function (bigCart, cartType) {
            if (!bigCart || !bigCart.carts) {
                return;
            }
            var now = new Date().getTime();
            //先将所有的全部设置成未选中
            CartService.setAllUnchecked(bigCart);
            var carts = bigCart.carts;
            for (var k in carts) {
                var cart = carts[k];
                //找到类型一样的购物车，设置成选中状态
                if (cart && cart.items && cart.cartType == cartType) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        //如果是预售的商品，需要判断是否在预售期限内
                        /* var depositBeginTime = item.depositBeginTime;
                         var balanceEndTime = item.balanceEndTime;
                         depositBeginTime = DateUtil.getLongTime(depositBeginTime);
                         balanceEndTime = DateUtil.getLongTime(balanceEndTime);
                         if (cartType == "preSale" && (balanceEndTime < now || depositBeginTime > now)) {
                         item.checked = false;
                         continue;
                         }*/
                        item.checked = true;
                    }
                }
            }
        },
        unCheckCartByType: function (bigCart, cartType) {
            if (!bigCart || !bigCart.carts) {
                return;
            }
            var carts = bigCart.carts;
            for (var k in carts) {
                var cart = carts[k];
                //找到类型一样的购物车，设置成不选中状态
                if (cart && cart.items && cart.cartType == cartType) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        item.checked = false;
                    }
                }
            }
        },
        unCheckByTemperatureControl: function (bigCart, cartType, temperatureControl) {
            if (!bigCart || !bigCart.carts || !temperatureControl) {
                return;
            }
            var carts = bigCart.carts;
            for (var k in carts) {
                var cart = carts[k];
                //找到类型一样的购物车，设置成不选中状态
                if (cart && cart.items && cart.cartType == cartType) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        if (item.temperatureControl && item.temperatureControl != temperatureControl && item.checked) {
                            item.checked = false;
                        }
                    }
                }
            }
        },
        convertSmallCart: function (carts) {
            if (!carts) {
                return null;
            }
            var newCarts = [];
            for (var i = 0; i < carts.length; i++) {
                var cart = carts[i];
                var buyItems = cart.buyItems;
                if (!buyItems) {
                    continue;
                }
                var newCart = {};
                var newBuyItems = [];
                for (var k = 0; k < buyItems.length; k++) {
                    var buyItem = buyItems[k];
                    var newBuyItem = {
                        productName: buyItem.productName,
                        number: buyItem.number,
                        checked: buyItem.checked,
                        productId: buyItem.productId,
                        skuId: buyItem.skuId,
                        realSkuId: buyItem.realSkuId,
                        unitPrice: buyItem.unitPrice,
                        totalPayPrice: buyItem.totalPayPrice,
                        totalPrice: buyItem.totalPrice,
                        depositPrice: buyItem.depositPrice,
                        balancePrice: buyItem.balancePrice,
                        totalDepositPrice: buyItem.totalDepositPrice,
                        totalBalancePrice: buyItem.totalBalancePrice,
                        itemId: buyItem.itemId,
                        cartId: buyItem.cartId,
                        cartType: buyItem.objType || cart.cartType,
                        icon: buyItem.icon,
                        orderAvailableRules: buyItem.orderAvailableRules,
                        availableRuleResults: buyItem.availableRuleResults,//单品规则
                        selectedOrderRuleId: buyItem.selectedOrderRuleId,
                        freePresents: buyItem.freePresents,
                        lowPricePresents: buyItem.lowPricePresents,
                        depositBeginTime: buyItem.depositBeginTime,
                        depositEndTime: buyItem.depositEndTime,
                        balanceBeginTime: buyItem.balanceBeginTime,
                        balanceEndTime: buyItem.balanceEndTime,
                        preSaleType: buyItem.preSaleType,
                        bookAmount: buyItem.bookAmount,
                        addCartPrice: buyItem.addCartPrice,
                        temperatureControl: buyItem.temperatureControl,
                        warehouseType: buyItem.warehouseType,
                        sellableCount: f.getSellableCount(buyItem.productId, buyItem.skuId),
                        minNumber: buyItem.minNumber,
                        maxNumber: buyItem.maxNumber
                    };
                    var diffPrice = 0;
                    if (newBuyItem.addCartPrice && newBuyItem.addCartPrice > 0) {
                        var addCartPrice = newBuyItem.addCartPrice / 100;
                        if (Number(addCartPrice) > Number(newBuyItem.unitPrice)) {
                            diffPrice = (Number(addCartPrice) - Number(newBuyItem.unitPrice)).toFixed(2);
                        }
                    }
                    newBuyItem.diffPrice = diffPrice;
                    newBuyItems.push(newBuyItem);
                }
                newCart = {
                    cartId: cart.cartId,
                    cartType: cart.cartType,
                    merchantName: cart.merchantName,
                    merchantId: cart.merchantId,
                    finalPayAmount: f.toFixed(cart.finalPayAmount),
                    buyItems: newBuyItems,
                    totalPayPrice: cart.totalPayPrice,
                    totalTaxPrice: cart.totalTaxPrice,
                    totalDeliveryFee: cart.totalDeliveryFee,
                    //freePresents: cart.freePresents,
                    totalOrderProductPrice: cart.totalOrderProductPrice,
                    //lowPricePresents: cart.lowPricePresents,
                    //availableRuleResults: cart.availableRuleResults
                };
                var orderRuleTargets = [];
                cart.availableRuleResults.forEach(function (rule) {
                    var newItems = [];
                    for (var p = 0; p < newCart.buyItems.length; p++) {
                        var buyItem = newCart.buyItems[p];
                        if (buyItem.selectedOrderRuleId && buyItem.selectedOrderRuleId == rule.ruleId) {
                            newItems.push(buyItem);
                        }
                    }
                    if (newItems.length > 0) {
                        var newRule = {};
                        newRule = $.copy(newRule, rule);
                        newRule.buyItems = newItems;
                        orderRuleTargets.push(newRule);
                        for (var x = 0; x < newItems.length; x++) {
                            for (var y = 0; y < newCart.buyItems.length; y++) {
                                if (newItems[x].itemId == newCart.buyItems[y].itemId) {
                                    newCart.buyItems.splice(y, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
                newCart.orderRuleTargets = orderRuleTargets;
                newCarts.push(newCart);
            }
            return newCarts;
        },
        getSellableCount: function (productId, skuId) {
            if (!productId || !skuId) {
                return 0;
            }
            return InventoryService.getSkuSellableCount(productId, skuId);
        },
        //检查预售商品的预售规则是否过期，是否审核通过
        checkPreSaleSate: function (bigCart) {
            if (!bigCart) {
                return bigCart;
            }
            var newCart = JSON.parse(bigCart + "");
            var carts = newCart.carts;
            if (!carts) {
                return bigCart;
            }
            var isUpdate = false;
            for (var cartId in carts) {
                var jCart = carts[cartId];
                if (jCart.cartType != "preSale") {
                    continue;
                }
                var items = jCart.items;
                if (!items) {
                    continue;
                }
                var removeItems = [];
                for (var itemId in items) {
                    var jItem = items[itemId];
                    var productId = jItem.productId;

                    var preSaleRule = PreSaleService.getProductPreSaleRule(productId);
                    if (!preSaleRule || preSaleRule == "null") {
                        removeItems.push(itemId);
                        continue;
                    }
                    var approveState = preSaleRule.approveState;//1：已审核，-1：审核不通过，0：未审核
                    var nowTime = new Date().getTime();
                    //判断尾款结束支付时间,如果不在预售期内或者未审核就从购物车删除
                    if (preSaleRule.depositEndLongTime < nowTime || approveState != "1") {
                        removeItems.push(itemId);
                        continue;
                    }
                }
                if (removeItems.length > 0) {
                    for (var i = 0; i < removeItems.length; i++) {
                        delete items[removeItems[i]];
                    }
                    isUpdate = true;
                }
            }
            if (isUpdate) {
                CartService.updateBigCart(newCart);
                bigCart = $.toJavaJSONObject(newCart);
            }
            return bigCart;
        },
        getOleMerchantId: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");
        },
        getScanbuyMerchantId: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "scanbuy_merchantId");
        },
        getScanbuyProductId: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "scanbuy_productId");
        },
        getRateOfRmb2IntegralExchange: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "RateOfRmb2IntegralExchange");
        },
        getOleStandardMerchantId: function () {
            return SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_standard_merchantId");
        },
        isOleMerchant: function (merchantId) {
            if (!merchantId) {
                return false;
            }
            var oleMerchantId = f.getOleMerchantId();
            if (!oleMerchantId) {
                return true;
            }
            return oleMerchantId == merchantId;
        },
        //优化toFixed bug问题
        toFixed: function (num, dec) {
            if (!dec) {
                dec = 2;
            }
            return Number(num).toFixed(dec);
            //return +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
        }

    };
    return f;
})();