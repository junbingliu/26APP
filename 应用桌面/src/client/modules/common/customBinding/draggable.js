ko.bindingHandlers.draggable = {
    init: function(element, valueAccessor, allBindingsAccessor,
                   viewModel, context) {
        var value = valueAccessor();
        var x;
        $(element).draggable({
            zIndex:"1000",helper:"clone", opacity: 0.7,appendTo: "body",revert:function(isvalid){
                context.$root.clearRepeat();
                return !isvalid;
            },
            drag:function(event,ui){
                var position = ui.position;
                x = position.left;
                if(position.left > screen.width - 280){
                    setTimeout(function(){
                        if(x > screen.width - 280) {
                            context.$root.doRepeat(context.$root.goNext,1200);
                        }
                    },100);

                }
                else if(position.left < 200){
                    setTimeout(function(){
                        if(x < 200) {
                            context.$root.doRepeat(context.$root.goPrev,1200);
                        }
                    },100);
                }
                else{
                    context.$root.clearRepeat();
                }
            }
        });
    }
};