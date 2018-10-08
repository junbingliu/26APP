function SkuSelectorDialog(){
    var self = this;
    self.layerIndex = null;
    self.skuSelector = new SkuSelector();
    self.callback = null;
    self.ok = function(){
        if(self.callback){
            self.callback(self.skuSelector.selectedSkuId());
        }
        //$("#skuSelector").foundation("reveal","close");
        if(self.layerIndex){
            layer.close(self.layerIndex);
        }
    }
    self.cancel = function(){
        $("#skuSelector").foundation("reveal","close");
    }
    self.setCallback = function(callback){
        self.callback = callback;
    }
    self.open = function(title){
        self.layerIndex = $.layer({
            type:1,
            title:'商品：' + title,
            offset:['150px',''],
            area:['700px','500px'],
            page:{
                dom:'#skuSelector'
            }

        });
        //$("#skuSelector").foundation("reveal","open");
    }
    self.init = function(skus,inventoryAttrs,callback){
        self.skuSelector.init(skus,inventoryAttrs);
        self.setCallback(callback);
    }
}

/*var skuSelectorDialog = null;
$(document).ready(function(){
    skuSelectorDialog = new SkuSelectorDialog();
    ko.applyBindings(skuSelectorDialog,document.getElementById("skuSelector"));
});*/

var skuSelectorDialog=null;
$(document).on("koInit",function(event,extraParams){
    var elem = document.getElementById("skuSelector");
    if(elem){
        skuSelectorDialog = new SkuSelectorDialog();
        ko.applyBindings(skuSelectorDialog,elem);
    }

});