/**
 * Created with IntelliJ IDEA.
 * User: mac
 * Date: 13-7-10
 * Time: 下午10:20
 * To change this template use File | Settings | File Templates.
 */


/*global ko: false */
/*global $: false */
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        if(ko.utils.unwrapObservable(value)){
            $(element).fadeIn();
        }
        else{
            $(element).fadeOut();
        }
    }
};