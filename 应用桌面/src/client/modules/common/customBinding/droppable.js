ko.bindingHandlers.droppable = {
    init: function(element, valueAccessor, allBindingsAccessor,
                   viewModel, context) {
        var value = valueAccessor();
        $(element).droppable({
            drop: function(evt, ui) {
                value(ui, context);
                //console.log("dropped.");
            }
        });
    }
};