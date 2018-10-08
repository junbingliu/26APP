//#import ../appConfig.js
//#import ../cart/carts.js
//#import ../attrs/attrs.js
//#import ../attrs/skuSelectorDialog.js
//#import ../util/LowPricePresentSelector.js
//#import ../util/util.js
//#import ../util/beans.js
//#import ../util/ruleSelectorDialog.js
//#import ../util/optionSelector.js
//#import ../util/certificate.js
//#import ../util/confirmDialog.js
//#import ../util/readCertificate.js
//#import ../util/IdCardPicUpload.js
//#import consignee.js
//#import invoice.js
//#import orderFormPayment.js
//#import PluginItem.js
//#import PluginItemIntegralPay.js
//#import PluginItemJiaJuQuanPay.js
//#import PluginItemUseTicket.js
//#import PluginItemPrepayCard.js
//#import PluginItemPreDepositPay.js
//#import deliveryPoint.js


function Address(address) {
    var self = this;
    var address = address || {};
    self.userName = ko.observable(address.userName);
    self.regionName = ko.observable(address.regionName);
    self.id = ko.observable(address.id);
    self.postCode = ko.observable(address.postCode);
    self.mobile = ko.observable(address.mobile);
    self.regionId = ko.observable(address.regionId);
    self.address = ko.observable(address.address);
    self.selectedDeliveryRuleId = ko.observable(address.selectedDeliveryRuleId);
    self.userLongitude = ko.observable(address.userLongitude);
    self.setData = function (data) {
        var data = data || {};
        self.userName(data.userName);
        self.id(data.id);
        self.postCode(data.postCode);
        self.mobile(data.mobile);
        self.regionId(data.regionId);
        self.address(data.address);
        self.selectedDeliveryRuleId(data.selectedDeliveryRuleId);
        self.regionName(data.regionName);
        self.userLongitude(data.userLongitude);
    }
}

function PayRec() {
    var self = this;
    self.payInterfaceId = "";
    self.name = "";
    self.money = "";
}

function OrderForm() {
    var self = this;    
    self.deliveryAddress = new Address();
    self.invoice = ko.observable(new Invoice());
    self.memo = ko.observable();
    self.addingOrder = ko.observable(false); //正在添加订单，防止多次点击添加订单按钮
    self.savingPayWayState = ko.observable(false);//正在保存地址，防止多次点击触发
    self.cartId = "";
    self.orderId = ko.observable("");
    self.cartType = "";
    self.buyerId = "";

    self.buyerMobile = "";
    self.paymentSelected = ko.observable(false);
    self.selectedPayments = ko.observableArray([]);
    self.selectedOcPayments = ko.observableArray();
    self.selectedPayInterfaceId = ko.observable();
    self.ocs = ko.observableArray();

    self.crossOrderRuleResults = ko.observableArray();

    self.useLayer = ko.computed(function () {
        if($.layer){
            return false;
        }
        return false;
    });

    self.serverTime = ko.observable(Date.now());
    self.getWjsPrefix = ko.observable((new Date().getMonth() + 1) + '月' + new Date().getDate() + '日');
    self.wjsTimeSlots = ko.observableArray([]);
    if (AppConfig && AppConfig.timeSlots) {
        $.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, null).done(function (ret) {
            var data = JSON.parse(ret);
            if (data && data.t) self.serverTime(parseInt(data.t));

            function mapResult(timeSlots, now) {
                var dup = new Date(parseInt(data.t));
                return JSON.parse(timeSlots).map(function (value) {
                    var timeRange = parseTimeRange(value.content);
                    return {
                        value: {
                            start: now.setHours(timeRange.startHour, timeRange.startMinute),
                            end: now.setHours(timeRange.endHour, timeRange.endMinute)
                        },
                        text: self.getWjsPrefix() + " " + value.content,
                        enable: dup.getTime() > now.setHours(timeRange.startHour, timeRange.startMinute) ? 'true' : 'false'
                    }
                });
            }

            self.wjsTimeSlots((function () {
                var now = new Date(parseInt(data.t)),
                    timeSlots = AppConfig.timeSlots || '';
                if (timeSlots) {
                    var timeSlotsList = JSON.parse(timeSlots);
                    var lastestTime = parseTimeRange(timeSlotsList[timeSlotsList.length - 1].content);
                    var lastLong = now.setHours(lastestTime.startHour, lastestTime.startMinute);
                    var useTomorrow = false;
                    //if(dup.getTime() > lastLong){
                    //    useTomorrow = true;
                    //    now.setDate(now.getDate()+1);
                    //    self.getWjsPrefix(now.getDate()+'月'+(now.getMonth()+1)+'日');
                    //}

                    // 今天
                    var result = mapResult(timeSlots, now);

                    // 明天
                    now.setDate(now.getDate() + 1);
                    self.getWjsPrefix((now.getMonth() + 1) + '月' + now.getDate() + '日');
                    result = result.concat(mapResult(timeSlots, now));

                    // 后天
                    now.setDate(now.getDate() + 1);
                    self.getWjsPrefix((now.getMonth() + 1) + '月' + now.getDate() + '日');
                    result = result.concat(mapResult(timeSlots, now));

                    result = result.filter(function (value) {
                        return value.enable === 'false';
                    });

                    result = result.slice(0, 8);
                    return result;
                } else {
                    return [];
                }
            })());
        });
    }
    // 是不是万家送订单
    self.isFastDelivery = ko.computed(function () {
        if (window.AppConfig) {
            return AppConfig.isFastDelivery;
        } else {
            return false;
        }
    });

    //是不是OLE订单
    self.isOLE = ko.computed(function () {
        if (window.AppConfig) {
            return AppConfig.isOLE;
        } else {
            return false;
        }
    });

    self.isWjsDeliveryPoint = ko.computed(function () {
        if (self.isFastDelivery() && self.ocs().length == 1) {
            var oc = self.ocs()[0];
            if (oc.selectedDeliveryRule() && oc.selectedDeliveryRule().supportDP() && !oc.isEmpty()) {
                return true;
            } else {
                return false;
            }
        }
        return false;
    });

    /*
     * 初始化万家送特别的自提点，初始化后要一直忘下传，直到selector
     * 下一站bean.js -> function Oc(){}-> self.wjsDeliveryPoints = ko.observable();
     */
    function initWjsDeliveryPoints(ocs) {
        if (self.isFastDelivery() || self.isOLE()) {
            $.post("/templates/public/shopping/handle/v3/loadDeliveryPoint.jsp", {
                merchantId: AppConfig.merchantId
            }, function (ret) {
                if (ret.state) {
                    var deliveryPoints = $.map(ret.points || [], function (r) {
                        return new DeliveryPoint(r);
                    });
                    ocs.forEach(function (value) {
                        value.wjsDeliveryPoints(deliveryPoints);
                    })
                }
            }, 'json');
        }
    }

    var parseTimeRange = function (timeRange) { // 12:22~14:44
        return {
            startHour: parseInt(timeRange.replace(/\s/g, '').replace(/~.*/g, '').replace(/:\d{2}/g, '')), // 12
            startMinute: parseInt(timeRange.replace(/\s/g, '').replace(/~.*/g, '').replace(/^\d{2}:/g, '')), // 22
            endHour: parseInt(timeRange.replace(/\s/g, '').replace(/^.*~/g, '').replace(/:\d{2}/g, '')), // 14
            endMinute: parseInt(timeRange.replace(/\s/g, '').replace(/^.*~/g, '').replace(/^\d{2}:/, '')) // 44
        }
    }

    self.chosenWjsTimeSlot = ko.observable();
    self.wjsTimeRange = function () {
        var now = new Date(self.serverTime());
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var val = hours * 100 + minutes;

        var nowStr = now.toLocaleString('zh-CN');
        nowStr = nowStr.replace(/\s.*/g, '');


        var dpta = AppConfig.wjsdpta || '10:00~12:00',
            dptp = AppConfig.wjsdptp || '17:30~19:00',
            dptea = AppConfig.wjsdptea || '09:00',
            dptep = AppConfig.wjsdptep || '16:00';


        var v1 = parseInt(dptea.replace(/[^\d]+/g, ''), 10),
            v2 = parseInt(dptep.replace(/[^\d]+/g, ''), 10),
            amTimeRange = parseTimeRange(dpta),
            pmTimeRange = parseTimeRange(dptp);

        if (val <= v1 && val < v2) {
            return [
                {
                    text: dpta,
                    value: {
                        start: now.setHours(amTimeRange.startHour, amTimeRange.startMinute),
                        end: now.setHours(amTimeRange.endHour, amTimeRange.endMinute)
                    }
                },
                {
                    text: dptp,
                    value: {
                        start: now.setHours(pmTimeRange.startHour, pmTimeRange.startMinute),
                        end: now.setHours(pmTimeRange.endHour, pmTimeRange.endMinute)
                    }
                }
            ];
        } else if (val > v1 && val <= v2) {
            return [
                {
                    text: dptp,
                    value: {
                        start: now.setHours(pmTimeRange.startHour, pmTimeRange.startMinute),
                        end: now.setHours(pmTimeRange.endHour, pmTimeRange.endMinute)
                    }
                }
            ];
        } else if (val > v2) {
            return [
                {
                    text: '现在不在自提时间'
                }
            ];
        }
    };
    self.couldChosenWjsDeliveryPoint = ko.computed(function () {
        var endHour = (AppConfig.wjsdptep || '16:00').replace(/:\d{2}/g, '');
        var endMinute = (AppConfig.wjsdptep || '16:00').replace(/^\d{2}:/g, '');
        var endTimeStep = new Date(self.serverTime()).setHours(endHour, endMinute, '00');
        return endTimeStep > self.serverTime();
    });

    self.chosenWjsTimeRange = ko.observable(self.wjsTimeRange()[0]);

    /*是否含有跨境订单*/
    self.isCrossBorder = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.isCrossBorder && !oc.isEmpty()) {
                return true;
            }
        }
    });

    /*是否含有跨境直邮订单*/
    self.isCrossDirectMail = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            //console.log("oc.isCrossDirectMail=",oc.isCrossDirectMail);
            if (oc.isCrossDirectMail && !oc.isEmpty()) {

                return true;
            }
        }
    });

    /*是不是全部都是跨境订单*/
    self.isAllCrossBorder = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (!oc.isCrossBorder) {
                return false;
            }
        }
        return true;
    });

    self.isGift = ko.computed(function () {
        return window.isGift;
    });

    self.isB2BMember = ko.observable(false);
    /*是否b2b会员*/
    self.billType = ko.observable("com");
    /*发票类型：默认普通发票*/
    /*是不是含有b2b订单*/
    self.isB2BOrder = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.isB2BOrder) {
                return true;
            }
        }
    });

    /*是不是全部都是b2b订单*/
    self.isAllB2BOrder = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (!oc.isB2BOrder) {
                return false;
            }
        }
        return true;
    });

    self.supportIntegral = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.supportIntegral) {
                return true;
            }
        }
        return false;
    });

    self.supportJiaJuQuan = ko.computed(function () {
        return true;
    });

    self.supportStoreCard = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.supportStoreCard) {
                return true;
            }
        }
        return false;
    });

    /*是否所有的oc都支持预付卡支付*/
    self.isAllOcsSupportStoreCard = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (!oc.supportStoreCard) {
                return false;
            }
        }
        return true;
    });

    self.supportPreDeposit = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.supportPreDeposit) {
                return true;
            }
        }
        return false;
    });

    self.supportTicket = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.supportTicket) {
                return true;
            }
        }
        return false;
    });

    self.addOrderState = ko.computed(function () {
        if (self.addingOrder()) {
            return "订单提交中...";
        } else {
            return "提交订单";
        }
    });
    /***收货人信息***/
    self.consignee = new Consignee();
    self.consignee.callback = function (consigneeAddress) {
        self.loadOrderForm(self.cartId, self.buyerId);
        self.certificate(self.consignee.currConsignee().certificate());
        //编辑完配送人，就必须修改支付与配送方式
        if (AppConfig.platform && AppConfig.platform == "mobile") {
            self.editingConsignee(false);
        } else {
            self.editDeliveryAndPayment();
        }

    };
    self.editingConsignee = ko.observable(false);
    self.editConsignee = function () {
        self.consignee.buyerId = self.buyerId;
        self.consignee.selectedAddressId(self.deliveryAddress.id());
        self.consignee.getConsigneeList();
        self.editingConsignee(true);
        self.editingDeliveryAndPayment(false);
    };
    /*** 收货人信息结束 ***/

    /**
     * 身份证信息 姓名,身份证号 begin
     */
    /*身份证号码begin*/
    self.certificate = ko.observable();
    /*身份证号码*/
    self.saveCertificate = ko.observable(true);
    /*默认不保存身份证信息*/
    /*初始化身份证读卡器,并读取身份证信息*/
    self.readCertificate = function () {
        if (!self.certificateReader) {
            self.certificateReader = new ReadCertificate(self);
        }
        self.certificateReader.readCard();
    };
    self.editingCertificate = ko.observable(true);
    self.updateCertificate = function () {
        self.editingCertificate(true);
    };
    self.confirmCertificate = function () {
        var result = self.validateCertificate();
        if (result.state != "ok") {
            if (self.useLayer()) {
                layer.alert(result.msg);
            } else {
                confirmDialog.show(result.msg, function () {
                });
            }
            return;
        }
        var postData = {};
        postData.addressId = self.deliveryAddress && self.deliveryAddress.id();
        postData.certificate = self.certificate();
        $.post("/buyflowApi/handler/order/saveCertificate.jsx", postData, function (ret) {
            if (ret.state == "ok") {
                self.editingCertificate(false);
                self.loadOrderForm(self.cartId, self.buyerId);
            } else {
                if (self.useLayer()) {
                    layer.alert(ret.msg);
                } else {
                    confirmDialog.show(ret.msg, function () {
                    });
                }
            }
        }, 'json');
    };
    self.validateCertificate = function () {
        var result = {
            state: "err"
        };
        if (!self.certificate()) {
            result.msg = "请输入收货人真实的身份证号！";
            return result;
        }
        var reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        var certificate = self.certificate();
        if (certificate) {
            certificate = certificate.trim();
            //将小写x转换成大写X
            certificate = certificate.replace("x", "X");
        }
        if (reg.test(certificate) === false) {
            result.msg = "请输入真实的18位身份证号！";
            return result;
        }
        self.certificate(certificate);
        if (!IdentityCodeValid(self.certificate())) {
            result.msg = "身份证验证错误，请输入收货人真实的身份证号！";
            return result;
        }
        result.state = "ok";
        return result;
    };
    /*显示身份证号码的时候，隐藏中间几位*/
    self.convertCertificate = ko.computed(function () {
        if (self.certificate()) {
            var certificate = self.certificate();
            if (certificate.length <= 8) {
                return certificate;
            }
            var newCertificate = certificate.substr(0, 4);
            newCertificate += "**********";
            newCertificate += certificate.substr(certificate.length - 4, 4);
            return newCertificate;
        }
        return "";
    });
    /*身份证号码end*/
    /*收货人姓名begin*/
    self.receiveUserName = ko.observable(self.deliveryAddress && self.deliveryAddress.userName() || "");
    self.editingUserName = ko.observable(false);
    self.updateUserName = function () {
        self.editingUserName(true);
    };
    self.saveUserName = function () {
        if (!self.receiveUserName()) {
            self.receiveUserName(self.deliveryAddress && self.deliveryAddress.userName());
            self.editingUserName(false);
            return;
        }
        if (self.receiveUserName() == self.deliveryAddress.userName()) {
            self.editingUserName(false);
            return;
        }
        var postData = {
            addressId: self.deliveryAddress && self.deliveryAddress.id(),
            userName: self.receiveUserName(),
            certificate: self.certificate()

        };
        $.post(AppConfig.url + AppConfig.updateAddressUserNameUrl, postData, function (ret) {
            if (ret.state != "ok") {
                if (self.useLayer()) {
                    layer.alert(ret.msg);
                } else {
                    confirmDialog.show(ret.msg, function () {
                    });
                }
            } else {
                self.deliveryAddress.userName(self.receiveUserName());
                self.editingUserName(false);
            }
        }, "JSON");
    };
    /*收货人姓名end*/

    /*身份证正反面begin*/
    self.idCardFrontPic = ko.observable("");
    self.idCardFrontPicPreviewPath = ko.observable("");
    self.idCardFrontPicPreviewFullPath = ko.observable("");
    self.idCardBackPic = ko.observable("");
    self.idCardBackPicPreviewPath = ko.observable("");
    self.idCardBackPicPreviewFullPath = ko.observable("");

    self.selectIdCardFrontPic = function () {
        return $("#idCardFrontPic").click();
    };

    self.selectIdCardBackPic = function () {
        return $("#idCardBackPic").click();
    };
    /*身份证正反面end*/

    /**
     * 身份证信息 end
     */
    self.firstTime = ko.observable(false);

    /***支付方式***/
    self.payRecs = ko.observableArray();

    self.updatePayRec = function (payRec) {
        var temRecs = [];
        var found = false;
        $.each(self.payRecs(), function (idx, old) {
            if (old.payInterfaceId == payRec.payInterfaceId) {
                if (payRec.money && payRec.money > 0) {
                    temRecs.push(payRec);
                    found = true;
                }

            }
            else {
                temRecs.push(old);
            }
        });
        if (!found) {
            if (payRec.money && payRec.money > 0) {
                temRecs.push(payRec);
            }
        }
        self.payRecs(temRecs);
        //如果订单待支付金额小于1元,并且订单的成交金额大于1元
        if (Number(self.leftPayAmount()) < AppConfig.leftCashPayAmount && Number(self.finalPayAmount()) >= AppConfig.leftCashPayAmount) {
            if (self.useLayer()) {
                layer.alert("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整其他支付方式使用金额.");
            }
            else {
                confirmDialog.show("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整其他支付方式使用金额.", function () {
                });
            }
            return;
        }
        for (var k in self.pluginItems) {
            var plugin = self.pluginItems[k];
            plugin.onOrderFormChanged(self);
        }
    };

    self.hasExtraPayRecs = ko.computed(function () {
        if (self.payRecs() && self.payRecs().length > 0) {
            return true;
        }
        return false;
    });


    /***支付和配送信息***/
    self.selectedDeliveryTimeId = ko.observable("");
    self.selectedDeliveryTimeName = ko.observable("");

    self.editingDeliveryAndPayment = ko.observable(false);
    self.editDeliveryAndPayment = function () {
        self.editingConsignee(false);
        self.editingDeliveryAndPayment(true);
    };
    self.paymentDesc = ko.observable("");
    self.selectedPaymentName = ko.computed(function () {
        if (self.selectedPayments() && self.selectedPayments().length > 0) {
            if (self.selectedPayments().length == 1) {
                return self.selectedPayments()[0].payment.name;
            } else {
                var result = "";
                $.each(self.selectedPayments(), function (i, payment) {
                    if (i == 0) {
                        result += payment.payment.name;
                    } else {
                        result += "+" + payment.payment.name;
                    }
                });
                return result;
            }
        }
        return "";
    });
    self.initedWjsPaymentAndDeliveryRule = ko.observable(false);
    self.saveSelectedPaymentAndDeliveryRule = function () {
        if (self.savingPayWayState()) {
            return;
        }
        var merIdRuleIdPairs = [];
        var allDeliveryRuleSelected = true;
        var allDeliveryTimeSelected = true;
        var allDeliveryPointSelected = true;

//        self.fastDeliveryTimeRange($("#deliveryTimeRange").val());

        if (!self.selectedDeliveryTimeId() && !self.isCrossBorder() && !self.isFastDelivery() && !self.notRequireDeliveryTime && !self.isGift()) {
            if (self.useLayer()) {
                layer.alert("请选择配送时间！");
            } else {
                confirmDialog.show("请选择配送时间！", function () {
                });
            }
            self.editingDeliveryAndPayment(true);
            return;
        }

        if (!self.deliveryPointSelected() && self.wjsTimeRange()[0].text == '现在不在自提时间') {
            if (self.useLayer()) {
                layer.alert("不在自提时间范围,请选择配送到家！");
            }
            else {
                confirmDialog.show("不在自提时间范围,请选择配送到家！", function () {
                });
            }
            return;
        }
        $.each(self.ocs(), function (i, oc) {
            if (!oc.selectedDeliveryTimeId()) {
                allDeliveryTimeSelected = false;
            } else {
                oc.selectedDeliveryTimeId(self.selectedDeliveryTimeId());
                oc.selectedDeliveryTimeName(self.selectedDeliveryTimeName());
            }
            //如果选中的配送规则是支持自提点的，但是并没有选中自提点
            if (!self.deliveryPointSelected()) {
                allDeliveryPointSelected = false;
            }
        });
        $.each(self.ocs(), function (i, oc) {
            if (!oc.selectedDeliveryRuleId()) {
                allDeliveryRuleSelected = false;
            }
            merIdRuleIdPairs.push({
                merchantId: oc.merchantId(),
                ruleId: oc.selectedDeliveryRuleId(),
                deliveryPointId: oc.selectedDeliveryPointId(),
                deliveryPointRegionId: oc.selectedDeliveryPointRegionId(),
                deliveryTimeId: self.selectedDeliveryTimeId(),
                cartId: oc.cartId
            });
        });

        /* 防止pc端弹窗 */
        if (!allDeliveryRuleSelected && !self.isFastDelivery()) {
            if (self.useLayer()) {
                layer.alert("请选择配送方式！");
            }
            else {
                confirmDialog.show("请选择配送方式！", function () {
                });
            }
            self.editingDeliveryAndPayment(true);
            return;
        }

        if (!allDeliveryPointSelected) {
            if (self.useLayer()) {
                layer.alert("请选择自提点！");
            }
            else {
                confirmDialog.show("请选择自提点！", function () {
                });
            }
            self.editingDeliveryAndPayment(true);
            return;
        }
        self.savingPayWayState(true);
        $.post(AppConfig.url + AppConfig.saveSelectedPaymentAndDeliveryRuleUrl, {
            addressId: self.deliveryAddress.id(),
            buyerId: self.buyerId,
            selectedPayInterfaceId: self.selectedPayInterfaceId(),
            merIdRuleIdPairs: JSON.stringify(merIdRuleIdPairs)

        }, function (ret) {
            self.savingPayWayState(false);
            if (ret.state == 'ok') {
                self.loadOrderForm(self.cartId, self.buyerId);
                self.editingDeliveryAndPayment(false);
                self.initedWjsPaymentAndDeliveryRule(true);
                self.initedWjsPaymentAndDeliveryRule(true);
            }
            else if (ret.state == 'err' && ret.msg == 'notLogin') {
                $(document).trigger("notLogin");
            }
        }, "json");
    };
    /***支付和配送信息结束***/

    /*** invoice ***/
    self.invoiceChooser = new InvoiceChooser();
    self.invoiceChooser.callback = function (consigneeAddress) {
        self.editingInvoice(false);
        self.loadOrderForm(self.cartId, self.buyerId);
    };
    self.editingInvoice = ko.observable(false);
    self.editInvoice = function () {
        self.invoiceChooser.buyerId = self.buyerId;
        self.invoiceChooser.getInvoiceList();
        self.invoiceChooser.selectedInvoiceId(self.invoice().id());
        self.invoiceChooser.setCurrentInvoice(self.invoice());
        self.editingInvoice(true);
    };

    self.pluginItems = {
        "integralPay": new PluginItemIntegralPay(),
        //"jiaJuQuanPay": new PluginItemJiaJuQuanPay(),
        "useTicket": new PluginItemUseTicket(),
        //"prepayCard": new PluginItemPrepayCard(),
        "preDeposit": new PluginItemPreDepositPay()
    };

    for (var k in self.pluginItems) {
        var plugin = self.pluginItems[k];
        plugin.onInit(self);
    }

    self.carts = new Carts();
    self.carts.readOnly(true);
    self.carts.isCheckingOut(true);
    self.totalOrderProductPrice = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalOrderProductPrice();
        }
        return sum.toFixed(2);
    });

    self.totalDeliveryFee = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalDeliveryFee();
        }
        return sum.toFixed(2);
    });

    self.totalProductDiscount = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalProductDiscount();
        }
        return sum.toFixed(2);
    });

    self.totalOrderDiscount = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalOrderDiscount();
        }
        return sum.toFixed(2);
    });

    self.totalDeliveryFeeDiscount = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalDeliveryFeeDiscount();
        }
        return sum.toFixed(2);
    });

    self.totalIntegralPrice = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.totalIntegralPrice();
        }
        return sum.toFixed(2);
    });

    //订单的成交价格
    self.finalPayAmount = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            sum += oc.finalPayAmount();
        }
        return sum;
    });
    //已支付金额
    self.paidAmount = ko.computed(function () {
        var sum = 0;
        $.each(self.payRecs(), function (idx, payRec) {
            sum += Number(payRec.money);
        });
        return sum;
    });
    //剩余未支付金额
    self.leftPayAmount = ko.computed(function () {
        var ret = self.finalPayAmount() - self.paidAmount();
        if (ret < 0) {
            ret = 0;
        }
        return ret.toFixed(2);
    });
    //使用积分金额(钱)
    self.usedIntegralAmount = ko.computed(function () {
        var sum = 0;
        $.each(self.payRecs(), function (idx, payRec) {
            if (payRec.payInterfaceId == 'payi_4') {
                sum += Number(payRec.money);
            }
        });
        return sum;
    });
    //使用购物券金额
    self.usedTicketAmount = ko.computed(function () {
        var sum = 0;
        $.each(self.payRecs(), function (idx, payRec) {
            if (payRec.payInterfaceId == 'payi_2') {
                sum += Number(payRec.money);
            }
        });
        return sum;
    });
    //使用储值卡金额
    self.usedPrepayCardAmount = ko.computed(function () {
        var sum = 0;
        $.each(self.payRecs(), function (idx, payRec) {
            if (payRec.payInterfaceId == 'payi_10') {
                sum += Number(payRec.money);
            }
        });
        return sum;
    });
    //使用品牌家居券金额
    self.usedJiaJuQuanAmount = ko.computed(function () {
        var sum = 0;
        $.each(self.payRecs(), function (idx, payRec) {
            if (payRec.payInterfaceId == 'payi_160') {
                sum += Number(payRec.money);
            }
        });
        return sum;
    });
    self.totalDiscount = ko.computed(function () {
        return (Number(self.totalOrderProductPrice()) + Number(self.totalDeliveryFee()) - Number(self.finalPayAmount())).toFixed(2);
    });
    /*所有的税金*/
    self.totalTaxPrice = ko.computed(function () {
        var sum = 0;
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            if (oc.isCollectTax && oc.needPayTax()) {
                sum += oc.totalTaxPrice();
            }
        }
        return sum.toFixed(2);
    });
    /*是否需要支付税金*/
    self.needPayTax = ko.computed(function () {
        return Number(self.totalTaxPrice()) > Number(AppConfig.maxTaxPrice);
    });
    /*原来需要支付的金额加上税金*/
    self.leftPayAmountInclucdTax = ko.computed(function () {
        var leftPayAmount = Number(self.leftPayAmount());
        var totalTaxPrice = Number(self.totalTaxPrice());
        /*如果税金大于50才需要一起结算*/
        if (self.needPayTax()) {
            leftPayAmount += totalTaxPrice;
        }
        return leftPayAmount.toFixed(2);
    });

    //跳到购物车
    self.goCart = function () {
        window.location.href = AppConfig.cartUrl;
    };

    self.askForPayment = function () {
        orderFormPayment.buyerId = self.buyerId;
        orderFormPayment.merchantId = self.merchantId;
        orderFormPayment.callback = function () {
            window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
        };
        orderFormPayment.init(self.payments(), self.selectedPaymentId());
        window.location.href = "#/orderFormPayment";
    };
    self.askForInvoice = function () {
        invoiceChooser.buyerId = self.buyerId;
        invoiceChooser.merchantId = self.merchantId();
        invoiceChooser.callback = function () {
            window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
        };
        invoiceChooser.getInvoiceList();
        invoiceChooser.selectedInvoiceId(self.invoice().id());
        window.location.href = "#/invoice";
    };
    self.askForMemo = function () {
        self.currentPage("orderFormMemo");
    };
    self.availablePayments = ko.computed(function () {
        //所有的支付方式取并集
        var payments = [];
        var paymentMap = {};
        $.each(self.ocs(), function (i, oc) {
            $.each(oc.paymentList(), function (j, payment) {
                paymentMap[payment.payInterfaceId] = payment;
            });
        });
        for (k in paymentMap) {
            var p = paymentMap[k];
            payments.push(p);
        }
        return payments;
    });
    self.calculateEffectivePayments = function (requestedPayInterfaceId) {
        var paymentMap = {};
        var pendingOcs = [];
        var noValidPayment = false;
        var desc = "因您的订单中含有";
        var merchants = '';
        self.paymentDesc('');
        var hasNotFound = false;
        for (var idx = 0; idx < self.ocs().length; idx++) {
            var oc = self.ocs()[idx];
            //1.如果用户有要求一种支付方式，那么如果商家支持这种支付方式，那么就选择这种支付方式
            var found = false;
            for (var i = 0; i < oc.paymentList().length; i++) {
                var payment = oc.paymentList()[i];
                if (requestedPayInterfaceId && payment.payInterfaceId == requestedPayInterfaceId) {
                    //如果商家支持，并且是货到付款，那么还需要判断所选择的支付方式是否货到付款。
                    if (requestedPayInterfaceId == 'payi_0') {
                        //是货到付款，判断选择的配送方式是否支持货到付款
                        if (oc.selectedDeliveryRuleEnableCod()) {
                            found = true;
                            break;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        found = true;
                        break;
                    }
                }
            }
            if (found) {
                if (!paymentMap[requestedPayInterfaceId]) {
                    paymentMap[requestedPayInterfaceId] = {
                        payment: oc.selectedPayment(),
                        totalProductNumber: oc.totalProductNumber()
                    }
                } else {
                    paymentMap[requestedPayInterfaceId].totalProductNumber += oc.totalProductNumber();
                }
            }
            //1.1如果商家不支持这种方式，那么自动选择一种商家支持的方式
            if (!found) {
                if (oc.paymentList() && oc.paymentList().length > 0) {
                    var payment = null;
                    var payInterfaceId = null;
                    for (var i = 0; i < oc.paymentList().length; i++) {
                        var payment = oc.paymentList()[i];
                        var payInterfaceId = payment.payInterfaceId;
                        //选择任意一种，只要不等于requestedPayInterfaceId
                        if (payInterfaceId != requestedPayInterfaceId) {
                            found = true;
                            break;
                        }
                    }
                    if (!paymentMap[payInterfaceId]) {
                        paymentMap[payInterfaceId] = {
                            payment: payment,
                            totalProductNumber: oc.totalProductNumber()
                        }
                    } else {
                        paymentMap[payInterfaceId].totalProductNumber += oc.totalProductNumber();
                    }
                    if (found && requestedPayInterfaceId == "payi_0") {
                        hasNotFound = true;
                        merchants += oc.merchantName() + ",";
                    }
                }
            }
            if (!found) {
                //商家根本没有可用的支付方式
                noValidPayment = true;
            }

        }
        //如果选择的是货到付款,但是存在有某个商家不支持货到付款,那么就提示,商家不支持货到付款
        if (hasNotFound) {
            merchants = merchants.substring(0, merchants.lastIndexOf(","));
            desc += merchants + "的商品,恕不支持货到付款";
            self.paymentDesc(desc);
        }
        if (noValidPayment) {
            return null;
        }
        var ret = [];
        for (payInterfaceId in paymentMap) {
            var payment = paymentMap[payInterfaceId];
            ret.push(payment);
        }
        return ret;
    };
    self.calculateEffectivePayments2 = function (selectedOcPayments) {
        if (!selectedOcPayments) {
            return null;
        }

        var ret = [];
        var existsObj = {};
        for (var idx = 0; idx < self.ocs().length; idx++) {
            var oc = self.ocs()[idx];
            var cartKey = oc.cartId;
            var selectPaymentId = selectedOcPayments[cartKey];
            for (var i = 0; i < oc.paymentList().length; i++) {
                var payment = oc.paymentList()[i];
                var payInterfaceId = payment.payInterfaceId;
                if (selectPaymentId == payInterfaceId && !existsObj[payInterfaceId]) {
                    var obj = {
                        payment: payment,
                        totalProductNumber: oc.totalProductNumber()
                    };
                    existsObj[payInterfaceId] = true;
                    ret.push(obj);
                }
            }
        }
        return ret;
    };
    self.deliveryRuleSelected = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            //有选中商品结算的才需要判断
            if (!oc.selectedDeliveryRuleId() && !oc.isEmpty()) {
                return false;
            }
        }
        return true;
    });
    self.setDeliveryTime = function (rule) {
        if (rule) {
            self.selectedDeliveryTimeId(rule.id());
            self.selectedDeliveryTimeName(rule.name());
        } else {
            self.selectedDeliveryTimeId("");
            self.selectedDeliveryTimeName("");
        }
        return true;
    };
    self.selectDeliveryTime = function (ruleId) {
        if (!self.deliveryTimes()) {
            self.setDeliveryTime(null);
            return;
        }
        if (!ruleId) {
            self.setDeliveryTime(null);
            return;
        }
        var r = null;
        $.each(self.deliveryTimes(), function (idx, rule) {
            if (rule.id() == ruleId) {
                r = rule;
            }
        });
        if (r == null) {
            self.setDeliveryTime(null);
        }
        else {
            self.setDeliveryTime(r);
        }
    };
    self.deliveryTimeSelected = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            //有选中商品结算的才需要判断
            if (!oc.selectedDeliveryTimeId() && !oc.isEmpty() && !self.isCrossBorder()) {
                return false;
            }
        }
        return true;
    });
    self.deliveryPointSelected = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            //如果是支持自提点，但是没有选择自提点
            var theSelectedDeliveryRule = oc.selectedDeliveryRule();
            if (theSelectedDeliveryRule && theSelectedDeliveryRule.supportDP() && !oc.isEmpty()) {
                if(!theSelectedDeliveryRule.deliveryPointSelector.hasDeliveryPoint() || !oc.selectedDeliveryPointId()){
                    return false;
                }
            }

        }
        return true;
    });
    //初始化配送时间
    self.deliveryTimes = ko.computed(function () {
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            return oc.deliveryTimes ? oc.deliveryTimes() : [];
        }
    });
    self.totalPromotionPrice = ko.observable();
    self.loadOrderForm = function (cartId, buyerId) {
        self.addingOrder(false);

        var postData = {
            cartId: cartId,
            merchantId: AppConfig.merchantId,
            selectedAddressId: self.deliveryAddress && self.deliveryAddress.id(),
            exm: AppConfig.exMerchantId,
            merchantType: AppConfig.merchantType,
            mergerCart: AppConfig.mergerCart,
            isFastDelivery: self.isFastDelivery(),
            isGift: window.isGift,
            giftRegionId: window.giftRegionId
        };

        if (buyerId) {
            postData.buyerId = buyerId;
        }
        self.cartId = cartId;
        self.buyerId = buyerId;
        self.carts.buyerUserId(buyerId);
        self.carts.loadCarts();
        $.post(AppConfig.url + AppConfig.orderFormUrl, postData, function (ret) {
            if (ret.state == 'err') {
                if (ret.msg == 'notlogin') {
                    if (AppConfig.platform && AppConfig.platform == "mobile") {
                        $(document).trigger("notLogin");
                    } else {
                        window.location.href = AppConfig.loginUrl;
                    }
                    return;
                }
                if (parent && parent.App && parent.App.toast) {
                    parent.App.toast.error("出现错误！" + ret.msg);
                }
                else {
                    alert("出现错误！" + ret.msg);
                }

                if (AppConfig.platform && AppConfig.platform == "mobile") {
                    if (AppConfig.indexUrl.charAt(0) == '#') {
                        parent.window.location.hash = AppConfig.indexUrl;
                    }
                    else {
                        parent.window.location.href = AppConfig.indexUrl;
                    }

                } else {
                    window.location.href = "/";
                }
                return;
            }
            if (ret.state == "ok" && ret.ocs.length == 0) {
                self.addingOrder(false);
                if (AppConfig.platform && AppConfig.platform == "mobile") {
                    if (AppConfig.platform_aom && AppConfig.platform_aom == "app") { // app or mobile
                        parent.native.goHomePage();
                    } else {
                        if (AppConfig.indexUrl.charAt(0) == '#') {
                            parent.window.location.hash = AppConfig.indexUrl;
                        }
                        else {
                            parent.window.location.href = AppConfig.indexUrl;
                        }
                    }
                } else {
                    window.location.href = "/";
                }
                return;
            }
            self.buyerId = buyerId;
            self.buyerMobile = ret.buyerMobile || "";//下单人手机号码
            self.invoice(new Invoice(ret.invoiceInfo));
            self.invoice().orderForm(self);
            /*发票信息*/

            /*设置默认支付方式*/
            if (ret.ocs) {
                var ocs = [];
                $.each(ret.ocs, function (idx, oc) {
                    if (self.isFastDelivery()) {
                        oc.isFastDelivery = true;
                    }
                    var o = new Oc(oc);
                    if (!o.isEmpty()) {
                        ocs.push(o);
                    }
                });
                self.ocs(ocs);
            }
            self.crossOrderRuleResults(ret.crossOrderRuleResults);

            initWjsDeliveryPoints(self.ocs());

            if (!self.ocs() || self.ocs().length == 0) {
                if (parent && parent.App && parent.App.toast) {
                    parent.App.toast.error("购物车是空的。");
                }
                else {
                    alert("购物车是空的。" + ret.msg);
                }
                if (AppConfig.platform && AppConfig.platform == "mobile") {
                    if (AppConfig.platform_aom && AppConfig.platform_aom == "app") {
                        parent.native.goHomePage();

                    } else {
                        window.location.href = AppConfig.indexUrl;
                    }
                } else {
                    window.location.href = "/";
                }
                return;
            }
            //如果没有选中的配送规则,那就要用户选择配送规则
            if (!self.deliveryRuleSelected() || !self.deliveryTimeSelected() || !self.deliveryPointSelected()) {
                if (!AppConfig.platform || AppConfig.platform != "mobile") {
                    self.editDeliveryAndPayment();
                }
            }
            for (k in self.pluginItems) {
                var plugItem = self.pluginItems[k];
                plugItem.onUpdate(ret);
            }
            if (ret.deliveryAddress == null) {
                self.deliveryAddress.setData({});
                //如果是转赠订单，就不需要再选择地址
                if (!window.isGift) {
                    self.editConsignee();
                    self.firstTime(true);
                    self.consignee.newConsignee();
                    $(document).trigger("orderFormLoaded");
                    return;
                }
            }
            else {
                self.firstTime(false);
                self.deliveryAddress.setData(ret.deliveryAddress);
                self.certificate(ret.deliveryAddress.certificate || "");
                self.idCardFrontPic(ret.deliveryAddress.idCardFrontPic || "");
                self.idCardFrontPicPreviewPath(ret.deliveryAddress.idCardFrontPicPreviewPath || "");
                self.idCardFrontPicPreviewFullPath(ret.deliveryAddress.idCardFrontPicPreviewFullPath || "");
                self.idCardBackPic(ret.deliveryAddress.idCardBackPic || "");
                self.idCardBackPicPreviewPath(ret.deliveryAddress.idCardBackPicPreviewPath || "");
                self.idCardBackPicPreviewFullPath(ret.deliveryAddress.idCardBackPicPreviewFullPath || "");
                self.receiveUserName(self.deliveryAddress && self.deliveryAddress.userName() || "");
                if (ret.deliveryAddress.certificate) {
                    self.editingCertificate(false);
                } else {
                    self.editingCertificate(true);
                }
            }
            //每个oc选择的支付方式
            if (ret.selectedPayments) {
                self.selectedOcPayments(ret.selectedPayments);
                var payments = self.calculateEffectivePayments2(ret.selectedPayments);
                if (payments != null && payments.length > 0) {
                    self.selectedPayments(payments);
                    self.selectedPayInterfaceId(payments[0].payment.payInterfaceId);
                    self.paymentSelected(true);
                } else {
                    self.selectedPayments([]);
                    self.selectedPayInterfaceId("");
                    self.paymentSelected(false);
                    self.editDeliveryAndPayment();
                }
            } else {
                self.paymentSelected(false);
                //让用户选
                self.editDeliveryAndPayment();
            }

            //如果只有一个配送时间,那就选中它
            if (self.deliveryTimes() && self.deliveryTimes().length == 1) {
                self.setDeliveryTime(self.deliveryTimes()[0]);
            } else {
                if (self.ocs() && self.ocs().length > 0) {
                    self.selectDeliveryTime(self.ocs()[0].selectedDeliveryTimeId());
                }
            }
            self.isB2BMember(ret.isB2bMember);
            self.billType(ret.billType);
            self.totalPromotionPrice(ret.totalPromotionPrice || 0);//优惠金额
            $(document).trigger("orderFormLoaded");
        }, "json");

    };

    self.checkRange = function () {
        if (self.isFastDelivery() && !self.isWjsDeliveryPoint() && AppConfig.merchantType == "EWJ_WJS") {
            var address = self.deliveryAddress.regionName() + self.deliveryAddress.address();
            var userLongitude = self.deliveryAddress.userLongitude() || "";
            $.when($.post(AppConfig.baseUrl + "phone_page/checkRange.jsp", {
                merchantId: AppConfig.merchantId,
                address: address,
                userLongitude: userLongitude
            })).then(function (ret) {
                var data = JSON.parse(ret);
                if (data.status == 'ok') {
                    self.addOrder();
                    // 定时达暂时注释
                    //return $.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, null);
                } else {
                    if (self.useLayer()) {
                        layer.alert("不在配送范围！");
                    }
                    else {
                        confirmDialog.show("不在配送范围！", function () {
                        });
                    }
                }
            })
            // 定时达暂时注释
            //    .then(function (ret) {
            //        var data = JSON.parse(ret);
            //        if (data && data.t) {
            //            var serverTime = data.t;
            //            //var serverTime = Date.now();
            //            var last = self.chosenWjsTimeSlot().value.start;
            //            if (serverTime > last) {
            //                confirmDialog.show("已过配送时间，请重新选择配送时间");
            //                self.editingDeliveryAndPayment(true);
            //            } else {
            //                self.addOrder();
            //            }
            //        }
            //    }
            //);
        } else if (self.isFastDelivery() && self.isWjsDeliveryPoint()) {
            $.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, {}, function (ret) {
                if (ret.t) {
                    var serverTime = ret.t;
                    self.serverTime(parseInt(ret.t));
                    var endHour = (AppConfig.wjsdptep || '16:00').replace(/:\d{2}/g, '');
                    var endMinute = (AppConfig.wjsdptep || '16:00').replace(/^\d{2}:/g, '');
                    var endTimeStep = new Date(parseInt(ret.t)).setHours(endHour, endMinute, '00');
                    if (endTimeStep < serverTime) {
                        confirmDialog.show("选择门店自提，请在" + AppConfig.wjsdptep + "前下单");
                        if (self.ocs().length <= 1) {
                            if (!self.couldChosenWjsDeliveryPoint()) {
                                var tempdrs = self.ocs()[0].deliveryResults();
                                tempdrs.forEach(function (value) {
                                    if (!value.supportDP()) {
                                        self.ocs()[0].setDeliveryRule(value);
                                    }
                                });
                            }
                        } else {
                            //throw new Error('万家送出现多商家结算');
                        }
                        self.editingDeliveryAndPayment(true);
                        return;
                    } else {
                        self.addOrder();
                    }
                }
            }, "json");
        } else if (AppConfig.merchantType == "EWJ_OLE") {
            if (1 * self.totalOrderProductPrice() < 1 * AppConfig.oleFeeLimit) {
                confirmDialog.show('购物金额尚未达到ole送频道最低消费（' + AppConfig.oleFeeLimit + '元）', function () {

                });
                return;
            }
            self.addOrder();
        } else {
            self.addOrder();
        }
    };

    self.addOrder = function () {
        if (self.addingOrder()) {
            return;
        }
        if (!self.deliveryAddress.id() && !window.isGift) {
            if (self.useLayer()) {
                layer.alert("请选收货人信息！");
            }
            else {
                confirmDialog.show("请选收货人信息！", function () {
                });
            }
            self.editConsignee();
            return;
        }
        if (!self.deliveryAddress.userName() && !window.isGift) {
            if (self.useLayer()) {
                layer.alert("请填写收货人姓名！");
            }
            else {
                confirmDialog.show("请填写收货人姓名！", function () {
                });
            }
            self.editConsignee();
            return;
        }

        if (self.isCrossBorder()) {
            if (self.editingUserName()) {
                if (self.useLayer()) {
                    layer.alert("请先保存收货人姓名！");
                }
                else {
                    confirmDialog.show("请先保存收货人姓名！");
                }
                return;
            }
            if (self.editingCertificate()) {
                if (self.useLayer()) {
                    layer.alert("请正确输入身份证号码并保存！");
                }
                else {
                    confirmDialog.show("请正确输入身份证号码并保存！", function () {
                    });
                }
                return;
            }
            var result = self.validateCertificate();
            if (result.state != "ok") {
                if (self.useLayer()) {
                    layer.alert(result.msg);
                } else {
                    confirmDialog.show(result.msg, function () {
                    });
                }
                return;
            }

            if (self.isCrossDirectMail()) {
                if (!self.idCardFrontPic() || self.idCardFrontPic() == "") {
                    if (self.useLayer()) {
                        layer.alert("请上传身份证正面照片！");
                    }
                    else {
                        confirmDialog.show("请上传身份证正面照片！", function () {
                        });
                    }
                    return;
                }

                if (!self.idCardBackPic() || self.idCardBackPic() == "") {
                    if (self.useLayer()) {
                        layer.alert("请上传身份证反面照片！");
                    }
                    else {
                        confirmDialog.show("请上传身份证反面照片！", function () {
                        });
                    }
                    return;
                }
            }
        }
        if (!self.paymentSelected()) {
            if (self.useLayer()) {
                layer.alert("请选择支付方式！");
            }
            else {
                confirmDialog.show("请选择支付方式！", function () {
                });
            }
            self.editDeliveryAndPayment();
            return;
        }

        /* e刻达订单不选择原先的配送方式 */
        if (!self.deliveryRuleSelected() && !self.isFastDelivery()) {
            if (self.useLayer()) {
                layer.alert("请选择配送方式！");
            }
            else {
                confirmDialog.show("请选择配送方式！", function () {
                });
            }
            self.editDeliveryAndPayment();
            return;
        }

        if (self.isFastDelivery() || self.isOLE()) {
            if (!self.initedWjsPaymentAndDeliveryRule()) {
                if (self.isWjsDeliveryPoint()) {
                    confirmDialog && confirmDialog.show("请选择自提时间");
                    self.editDeliveryAndPayment();
                    return;
                } else {
                    confirmDialog && confirmDialog.show("请选择配送时间");
                    self.editDeliveryAndPayment();
                    return;
                }
            }
        }

        if (!self.deliveryTimeSelected() && !(self.isCrossBorder() || self.isFastDelivery()) && !self.notRequireDeliveryTime && !self.isGift()) {
            if (self.useLayer()) {
                layer.alert("请选择配送时间！");
            }
            else {
                confirmDialog.show("请选择配送时间！", function () {
                });
            }
            self.editDeliveryAndPayment();
            return;
        }

        if (!self.deliveryPointSelected()) {
            if (self.useLayer()) {
                layer.alert("请选择自提点！");
            }
            else {
                confirmDialog.show("请选择自提点！", function () {
                });
            }
            self.editDeliveryAndPayment();
            return;
        }
        if (self.editingDeliveryAndPayment()) {
            if (self.useLayer()) {
                layer.alert("请先保存支付和配送信息！");
            }
            else {
                confirmDialog.show("请先保存支付和配送信息！");
            }
            return;
        }
        //如果订单待支付金额小于1元,并且订单的成交金额大于1元
        if (Number(self.leftPayAmount()) < AppConfig.leftCashPayAmount && Number(self.finalPayAmount()) >= AppConfig.leftCashPayAmount) {
            if (self.useLayer()) {
                layer.alert("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整积分或购物券使用金额.");
            }
            else {
                confirmDialog.show("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整积分或购物券使用金额.", function () {
                });
            }
            return;
        }
        var cartIds = [];
        for (var i = 0; i < self.ocs().length; i++) {
            var oc = self.ocs()[i];
            cartIds.push(oc.cartId);
        }
        //移动端
        if (AppConfig.platform && AppConfig.platform == "mobile") {
            var sourceType = [{id: 'mobile_androidApp', name: '安卓App'},
                {id: 'mobile_androidWeb', name: '安卓触屏'},
                {id: 'mobile_iosApp', name: '苹果App'},
                {id: 'mobile_iosWeb', name: '苹果触屏'}];
            var ngUserAgent = navigator.userAgent.toLocaleLowerCase();
            if (AppConfig.platform_aom && AppConfig.platform_aom == "app") {
                if (ngUserAgent.match(/(Android)/i)) {
                    self.source = sourceType[0].id;
                } else if (ngUserAgent.match(/(iPhone|iPod|ios|iPad)/i)) {
                    self.source = sourceType[2].id;
                }
            } else {
                if (ngUserAgent.match(/(Android)/i)) {
                    self.source = sourceType[1].id;
                } else if (ngUserAgent.match(/(iPhone|iPod|ios|iPad)/i)) {
                    self.source = sourceType[3].id;
                }
            }
        }

        var postData = {
            cartIds: cartIds.join(","),
            memo: self.memo(),
            buyerId: self.buyerId,
            selectedAddressId: self.deliveryAddress && self.deliveryAddress.id(),
            certificate: self.certificate(),
            idCardFrontPic: self.idCardFrontPic(),
            idCardBackPic: self.idCardBackPic(),
            selectedPayInterfaceId: self.selectedPayInterfaceId(),
            merchantId: AppConfig.merchantId,  // 这各种接口接收的都不一样啊
            exm: AppConfig.exMerchantId,
            source: self.source || "",
            merchantType: AppConfig.merchantType,
            saveCertificate: self.saveCertificate(),
            selectedOcPayments: JSON.stringify(self.selectedOcPayments()),
            isGift: window.isGift,
            giftRegionId: window.giftRegionId
        };

        if (self.isFastDelivery() || self.isOLE()) {
            if (self.isWjsDeliveryPoint()) {  //万家送自提订单
                postData.fastDeliveryStart = self.chosenWjsTimeRange().value.start;
                postData.fastDeliveryEnd = self.chosenWjsTimeRange().value.end;
                // 配送方式选择自提，发现订单信息没有isDeliveryPoint = 1,手动加上一个
                postData.isDeliveryPoint = 1;
            } else {
                // 定时达暂时注释
                //postData.fastDeliveryStart = self.chosenWjsTimeSlot().value.start;
                //postData.fastDeliveryEnd = self.chosenWjsTimeSlot().value.end;
            }
        }
        $.each(self.payRecs(), function (idx, rec) {
            postData[rec.payInterfaceId] = rec.money;
        });

        for (k in self.pluginItems) {
            var plugItem = self.pluginItems[k];
            if (plugItem.onAddOrder) {
                var extraData = plugItem.onAddOrder();
                $.extend(postData, extraData);
            }
        }

        if (typeof orderFormExtras != 'undefined') {
            $.each(orderFormExtras, function (idx, extra) {
                var extraData = extra.onAddOrder(self);
                $.extend(postData, extraData);
            });
        }
        var postUrl = AppConfig.url + AppConfig.addOrderUrl;

        if (self.isFastDelivery()) {
            postUrl = AppConfig.url + AppConfig.sonAddOrderUrl;
        }

        self.addingOrder(true);
        if (!postData.merchantType) {
            postData.merchantType = AppConfig.merchantTypeForApp;
        }
        $.post(postUrl, postData, function (ret) {
            self.addingOrder(false);
            if (ret.state == 'ok') {
                if (AppConfig.platform && AppConfig.platform == "mobile") {
                    if (parent) {
                        if (AppConfig.ewjIdentify) {
                            parent.native.nativeToPay(ret.orderIds);
                        } else {
                            parent.window.location.hash = "#/orderResultPage/" + ret.orderIds;
                        }
                    }
                } else {
                    var useJiaJuQuanMoney = ret.useJiaJuQuanMoney;
                    if (useJiaJuQuanMoney) {
                        //如果有使用家居券支付，直接先跳转到家居券支付页面
                        window.location.href = AppConfig.jiaJuQuanPayUrl + "?orderIds=" + ret.orderIds + "&useMoney=" + useJiaJuQuanMoney;
                    } else {
                        window.location.href = AppConfig.payUrl + "?orderIds=" + ret.orderIds;
                    }

                }
            } else {
                if (self.useLayer()) {
                    layer.alert(ret.msg, function () {
                        if (ret.code && ret.code == 'notLogin') {
                            window.location.href = AppConfig.loginUrl;
                            return;
                        }
                    });
                }
                else {
                    confirmDialog.show(ret.msg, function () {
                        if (ret.code && ret.code == 'notLogin') {
                            if (AppConfig.platform && AppConfig.platform == "mobile") {
                                parent.window.location.href = AppConfig.loginUrl;
                            } else {
                                window.location.href = AppConfig.loginUrl;
                            }
                            return;
                        }
                    });
                }

                self.addingOrder(false);
                if (ret.code && ret.code == 'address') {
                    self.editConsignee();
                }
            }
        }, "JSON");
    };
    if (typeof orderFormExtras !== 'undefined') {
        $.each(orderFormExtras, function (idx, extra) {
            extra.init(self);
        });
    }
}
