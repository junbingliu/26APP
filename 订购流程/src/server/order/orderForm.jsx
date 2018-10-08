//#import Util.js
//#import cart.js
//#import card.js
//#import normalBuy.js
//#import login.js
//#import address.js
//#import delivery.js
//#import payment.js
//#import userProfile.js
//#import invoice.js
//#import account.js
//#import saasRegion.js
//#import merchant.js
//#import session.js
//#import user.js
//#import md5Service.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx
//#import $IDCardLib:services/IDCardLibUtil.jsx

;
(function () {
    var ArrayList = java.util.ArrayList;
    var cartId = $.params.cartId;
    var merchantId = $.params.merchantId;//结算商家
    var exMerchantId = $.params.exm;//不包含结算商家
    var buyingDevice = $.params.buyingDevice;
    var isGift = $.params.isGift;
    var idCardSpex = $.params.idCardSpex || "144X90";
    var giftRegionId = $.params.giftRegionId;
    if (isGift && isGift != "false") {
        isGift = true;
    } else {
        isGift = false;
    }
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin"};
        out.print(JSON.stringify(ret));
        return;
    }

    var serverTime = new Date().getTime();

    var defaultAddress = AddressService.getDefaultAddress(userId);
    if (defaultAddress) {
        if (defaultAddress.selectedDeliveryRuleIds) {
            regionId = defaultAddress.regionId;
            //不要把所有商户里选择的配送方式发送到客户端
            defaultAddress.selectedDeliveryRuleIds = null;
        }
        if (!defaultAddress.regionName) {
            defaultAddress.regionName = SaasRegionService.getFullPathString(defaultAddress.regionId);
        }
        if (defaultAddress.certificate) {
            //解密身份证信息
            defaultAddress.certificate = Md5Service.decString(defaultAddress.certificate, "!@#$%^") + "";
        }

        if(!defaultAddress.state){
            defaultAddress.state = "0";//默认为未审核状态返回
        }

        //先从地址本获取身份证图片，再根据姓名和身份证号到身份证库获取
        var isGetFontPicFromIdCardLib = true;
        var isGetBackPicFromIdCardLib = true;
        if(defaultAddress.state != "2"){
            if(defaultAddress.idCardFrontPic){
                defaultAddress.idCardFrontPicPreviewPath = FileService.getRelatedUrl(defaultAddress.idCardFrontPic, idCardSpex);
                defaultAddress.idCardFrontPicPreviewFullPath = FileService.getFullPath(defaultAddress.idCardFrontPic);
                isGetFontPicFromIdCardLib = false;
            }

            if(defaultAddress.idCardBackPic){
                defaultAddress.idCardBackPicPreviewPath = FileService.getRelatedUrl(defaultAddress.idCardBackPic, idCardSpex);
                defaultAddress.idCardBackPicPreviewFullPath = FileService.getFullPath(defaultAddress.idCardBackPic);
                isGetBackPicFromIdCardLib = false;
            }
        }

        if(isGetFontPicFromIdCardLib && isGetBackPicFromIdCardLib && defaultAddress.userName && defaultAddress.certificate){
            var jIdCardInfo = IDCardLibUtil.getIdCardPic(defaultAddress.userName, defaultAddress.certificate, idCardSpex);
            if(jIdCardInfo){
                //$.log("\n...................................666666666666.............jIdCardInfo="+JSON.stringify(jIdCardInfo));
                if(isGetFontPicFromIdCardLib){
                    defaultAddress.idCardFrontPic = jIdCardInfo.idCardFrontPic || "";
                    defaultAddress.idCardFrontPicPreviewPath = jIdCardInfo.idCardFrontPicPreviewPath || "";
                    defaultAddress.idCardFrontPicPreviewFullPath = jIdCardInfo.idCardFrontPicPreviewFullPath || "";
                }

                if(isGetBackPicFromIdCardLib){
                    defaultAddress.idCardBackPic = jIdCardInfo.idCardBackPic || "";
                    defaultAddress.idCardBackPicPreviewPath = jIdCardInfo.idCardBackPicPreviewPath || "";
                    defaultAddress.idCardBackPicPreviewFullPath = jIdCardInfo.idCardBackPicPreviewFullPath || "";
                }
            }
        }

    }
    var selectedPayments = {};//存放每个oc选中的paymentId
    var selectedPayInterfaceId = UserProfileService.getUserInfo(userId, "payInterfaceId");

    var isB2bMember = false;//是否企业会员
    var billType = "";//发票类型
    var payType = "";//结款方式
    var jUser = UserService.getUser(userId);
    if (jUser) {
        payType = jUser.payType || "";
        billType = jUser.billType || "";
        isB2bMember = (jUser.isB2bMember == "Y");
    }
    var ocs = NormalBuyFlowService.getOcsWithGift(userId, buyingDevice, "common", true, null, isGift, giftRegionId);
    if (ocs != null) {
        ocs.forEach(function (oc, index) {
            if (merchantId) {
                var mids = merchantId.split(",");
                var midList = new ArrayList(mids);
                if (!midList.contains(oc.merchantId)) {
                    ocs[index] = {};
                    return;
                }
            }
            if (exMerchantId && (exMerchantId == oc.merchantId)) {
                ocs[index] = {};
                return;
            }
            var paymentList = [];//PaymentService.getPaymentsForMobile(merchantId);
            //如果配送方式里面有支持COD的，才取出COD支付方式
            var supportCod = false;
            if (!isGift) {
                //如果是送礼就不支持货到付款
                if (oc.availableDeliveryRuleResults) {
                    oc.availableDeliveryRuleResults.forEach(function (rule) {
                        if (rule.enableCOD) {
                            supportCod = true;
                        }
                    });
                }
            }

            var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
            if (inheritPlatform) {
                oc.payMerchantId = "head_merchant";
            }
            else {
                oc.payMerchantId = oc.merchantId;
            }
            //selectedPayInterfaceId = UserProfileService.getUserInfo(userId, "payInterfaceId");
            if (supportCod) {
                var codPayment = PaymentService.getCodPayment(oc.payMerchantId);
                if (codPayment) {
                    codPayment.isOnline = false;
                    codPayment.isCod = true;
                    codPayment.desc = "送货上门后再收款、支持现金、pos机刷卡、支票支付 查看服务及配送范围";
                    paymentList.push(codPayment);
                }
            }

            var onlinePayment = PaymentService.getOnlinePayment(oc.payMerchantId);
            if (onlinePayment) {
                onlinePayment.isOnline = true;
                onlinePayment.isCod = false;
                onlinePayment.desc = "即时到帐，支持绝大数银行借记卡及部分银行信用卡";
                paymentList.push(onlinePayment);
            }


            var selectedPaymentId = null;
            if (selectedPayInterfaceId) {
                paymentList.forEach(function (elem) {
                    if (elem.payInterfaceId == selectedPayInterfaceId) {
                        selectedPaymentId = elem.id;
                    }
                });
            }

            paymentList = paymentList.map(function (payment) {
                return {
                    id: payment.id,
                    name: payment.paymentName,
                    payInterfaceId: payment.payInterfaceId,
                    isOnline: payment.isOnline,
                    isCod: payment.isCod,
                    desc: payment.desc
                };
            });
            oc.supportIntegral = false;
            oc.supportStoreCard = false;
            oc.supportPreDeposit = false;
            oc.supportTicket = false;
            oc.supportJiaJuQuan = false;
            //根据订单类型取订单适用范围内的支付方式
            var payments = PaymentService.getMerchantAllPaymentsByOrderType(oc.payMerchantId, oc.orderType);
            if (payments) {
                payments.forEach(function (payment) {
                    if (payment.objectMap.payInterfaceId == 'payi_2') {
                        oc.supportTicket = true;
                    }
                    if (payment.objectMap.payInterfaceId == 'payi_4') {
                        oc.supportIntegral = true;
                    }
                    if (payment.objectMap.payInterfaceId == 'payi_5') {
                        oc.supportPreDeposit = true;
                    }
                    if (payment.objectMap.payInterfaceId == 'payi_10') {
                        oc.supportStoreCard = true;
                    }
                    if (payment.objectMap.payInterfaceId == 'payi_160') {
                        oc.supportJiaJuQuan = true;
                    }
                });
            }
            oc.paymentList = paymentList;
            oc.selectedPaymentId = selectedPaymentId;
            if (selectedPaymentId) {
                oc.selectedPayInterfaceId = selectedPayInterfaceId;
                selectedPayments[oc.cartKey] = selectedPayInterfaceId;
            } else {
                //如果没有可选的payInterfaceId，要给一个在线支付的支付方式
                selectedPayments[oc.cartKey] = "payi_1";
                oc.selectedPayInterfaceId = null;
            }
            //$.log("\n...................oc="+JSON.stringify(oc.allCardBatches));
        });
    }

    //获得用户拥有的积分

    var integralBalance = 0;
    try {
        integralBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "shoppingIntegral");
    } catch (e) {
        $.log("获取线下会员积分失败：" + e);
    }
    var integralMoneyRatio = 0 + AccountService.getIntegralMoneyRatio();
    var depositBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "eWallet");
    var jArgs = PreDepositRuleSettingService.getArgs();
    if (!jArgs) {
        jArgs = {};
    }
    var depositAppliedColumnIds = [];
    var isEnableRule = false;//是否启用预存款使用规则，默认为false
    var columnIds = jArgs.columnIds;
    if (columnIds && columnIds != "") {
        var cIds = columnIds.split(",");
        for (var i = 0; i < cIds.length; i++) {
            var cid = cIds[i];
            depositAppliedColumnIds.push(cid);
        }
    }

    if(jArgs.isEnableRule && jArgs.isEnableRule == "1"){
        isEnableRule = true;
    }

    if (isEnableRule && depositAppliedColumnIds.length > 0) {
        //当设置了预存款使用规则，则判断用户的预存款有效期
        var preDepositRuleBeginTime = 0;
        var preDepositRuleEndTime = 0;
        if (jUser.preDepositRuleBeginTime) {
            preDepositRuleBeginTime = Number(jUser.preDepositRuleBeginTime);
        }
        if (jUser.preDepositRuleEndTime) {
            preDepositRuleEndTime = Number(jUser.preDepositRuleEndTime);
        }

        if (!(preDepositRuleBeginTime < serverTime && serverTime < preDepositRuleEndTime)) {
            //当不在有效期内则把可用预存款设置为0
            depositBalance = "0";
        }
    }

    var defaultInvoice = InvoiceService.getDefaultInvoice(userId);
    var userTradeInfo = UserService.getUserTradeInfo(userId);
    var saveCertificate = userTradeInfo && userTradeInfo.saveCertificate || "";

    /**
     * v3 的内容
     */
    var allCardBatches = CardService.getUserCardBatches(userId);
    var bigCart = CartService.getNativeBigCart(false);
    CartService.upgrade(bigCart);
    CartService.populatePrices(bigCart, userId, 0, true);

    var isDirty = CartService.executePlans(bigCart, userId, 10 * 60 * 1000, true);
    CartService.calculateDeliveryRulesForAll(bigCart, userId);

    var jCrossOrderRules = bigCart.optJSONObject("orderRules");
    var crossOrderRules = null;

    if (jCrossOrderRules != null) {
        crossOrderRules = JSON.parse("" + jCrossOrderRules.toString());
    }
    var crossOrderRuleResults = [];
    if (crossOrderRules) {
        for (var ruleId in crossOrderRules) {
            var crossOrderRule = crossOrderRules[ruleId];
            if (crossOrderRule && crossOrderRule.result) {
                crossOrderRuleResults.push(crossOrderRule.result);
            }
        }
    }
    //$.log("\n...................crossOrderRuleResults="+JSON.stringify(crossOrderRuleResults));
    crossOrderRuleResults.forEach(function(rule){
        if(rule.availableCardRules){
            for (var i = 0; i < rule.availableCardRules.length; i++) {
                var batches = [];
                var availableBatches = rule.availableCardRules[i].availableBatches;
                for(var k =0;k<availableBatches.length;k++){
                    var jBatch = availableBatches[k];
                    for(var m=0;m<allCardBatches.length;m++){
                        if(jBatch.id == allCardBatches[m].id){
                            jBatch = allCardBatches[m];
                        }
                    }
                    batches.push(jBatch);
                }
                rule.availableCardRules[i].availableBatches = batches;
            }
        }
    });


    /**
     * end v3的内容
     */


    var ret = {
        state: "ok",
        deliveryAddress: defaultAddress,
        ocs: ocs,
        buyerMobile: jUser.mobilPhone || "",
        selectedPayInterfaceId: selectedPayInterfaceId,
        selectedPayments: selectedPayments,
        invoiceInfo: defaultInvoice,
        integralBalance: integralBalance,
        depositBalance: depositBalance,
        depositAppliedColumnIds:depositAppliedColumnIds,
        integralMoneyRatio: integralMoneyRatio,
        serverTime: serverTime,
        saveCertificate: saveCertificate,
        crossOrderRuleResults:crossOrderRuleResults
    };

    out.print(JSON.stringify(ret));
})();

