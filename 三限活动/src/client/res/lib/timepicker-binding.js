ko.bindingHandlers.timepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize timepicker with some optional options
        var options = allBindingsAccessor().timepickerOptions || { dateFormat:'yy-mm-dd',addSliderAccess: true,sliderAccessArgs: { touchonly: false }};
        $(element).datetimepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datetimepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            $(element).timepicker("destroy");
        });

    },
    //update the control when the view model changes
    update: function (element, valueAccessor) {

        var value = ko.utils.unwrapObservable(valueAccessor()),
            current = $(element).datetimepicker("getDate");
        if(current){
        }

        if (value - current !== 0) {
            $(element).datetimepicker("setDate", value);
        }
    }
};
