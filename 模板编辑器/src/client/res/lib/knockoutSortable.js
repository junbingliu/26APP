/**
 * Created by Zheng on 13-12-21.
 */
ko.bindingHandlers.sortable = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var config = valueAccessor();
        if(!config) { return; }

        var allBindings = allBindingsAccessor();
        var array = allBindings.foreach || allBindings.template.foreach;

        var $list = jQuery(element);

        $list
            .data('ko-sort-array', array)
            .sortable(config)
            .bind('sortstart', function (event, ui) {
                ui.item.data('ko-sort-array', array);
                ui.item.data('ko-sort-index', ui.item.index());
            })
            .bind('sortupdate', function (event, ui) {
                var $newList = ui.item.parent();
                if($newList[0] != $list[0]){ return; }

                var oldArray = ui.item.data('ko-sort-array');
                var oldIndex = ui.item.data('ko-sort-index');

                var newArray = $newList.data('ko-sort-array');
                var newIndex = ui.item.index();

                var item = oldArray.splice(oldIndex, 1)[0];
                newArray.splice(newIndex, 0, item);
            });
    }
};
