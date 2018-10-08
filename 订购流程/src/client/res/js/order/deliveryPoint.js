function DeliveryPointSelector(data) {
    var self = this;
   
    self.currDeliveryPoint = ko.observable();
    self.deliveryPointList = ko.observableArray([]);
    self.regionSelector = new OptionSelector();
    self.selectedDeliveryPointId = ko.observable();
    self.merchantId = data.merchantId || "";
    self.deliveryPointRegionId = ko.observable(data.deliveryPointRegionId || "");
    self.noDeliveryPointDesc = ko.observable("该地区没有设置自提点，请选择其他区域！");
    self.hasDeliveryPoint = ko.computed(function () {
        return self.deliveryPointList().length > 0;
    });
    self.regionSelector.registerChangeHandler(function (optionSelector, optionLevel) {
        if (optionLevel.currentOptionId()) {
            self.loadRegionChildren(optionLevel.currentOptionId());
            self.loadDeliveryPoint(optionLevel.currentOptionId());
            self.deliveryPointRegionId(optionLevel.currentOptionId());
        }
    });
    self.selectDeliveryPoint = function (deliveryPoint) {
        self.selectedDeliveryPointId(deliveryPoint.id());
        self.setCurrentDeliveryPoint(deliveryPoint);
    };

    self.getCurrentDeliveryPoint = function () {
        var deliveryPoint = null;
        $.each(self.deliveryPointList(), function (index, elem) {
            if (elem.id() == self.selectedDeliveryPointId()) {
                deliveryPoint = elem;
            }
        });
        return deliveryPoint;
    };

    self.setDeliveryPointList = function (deliveryPointList) {
        self.deliveryPointList(deliveryPointList);
    };

    self.loadRegionChildren = function (regionId) {
        $.post(AppConfig.getRegionChildrenUrl, {regionId: regionId}, function (ret) {
            if (ret.state == 'ok') {
                self.regionSelector.addOptionLevel(ret.regionLevel);
            }
        }, "JSON");
    };

    self.loadRegion = function (regionId) {
        $.post(AppConfig.getRegionLevelsUrl, {regionId: regionId || "c_region_1602"}, function (ret) {
            if (ret.state == 'ok') {
                self.regionSelector.setOptionLevels(ret.regionLevels);
            }
        }, "JSON");
    };

    self.setCurrentDeliveryPoint = function (deliveryPoint) {
        self.currDeliveryPoint(deliveryPoint);
        self.loadRegion(deliveryPoint.regionId())
    };
    self.loadDeliveryPoint = function (regionId) {
        $.post("/templates/public/shopping/handle/v3/loadDeliveryPoint.jsp", {
            regionId: regionId || "c_region_1602",
            merchantId: self.merchantId
        }, function (ret) {
            if (ret.state) {
                var deliveryPoints = $.map(ret.points || [], function (r) {
                    return new DeliveryPoint(r);
                });
                self.setDeliveryPointList(deliveryPoints);
            } else {
                self.setDeliveryPointList([]);
                self.noDeliveryPointDesc(ret.errorMsg);
            }
        }, "JSON");
    };
}