function PresentRecord(data,parent){
    data = data || {};
    var self = this;
    $.extend(self,data);
    self.parent = parent;
    self.selectedNumber = ko.observable(data.number);
    self.checked = ko.observable(data.checked);
    self.checked.subscribe(function(newValue){
        if(newValue==true){
            var remain = self.parent.remainNumber();
            if(remain < self.selectedNumber()){
                var diff = self.selectedNumber()-remain;
                setTimeout(function() {
                    $.each(self.parent.presents(), function (idx, p) {
                        if(p.checked() && self.productId!= p.productId){
                            if(diff>0){
                                diff = diff - p.selectedNumber();
                                p.checked(false);
                            }
                        }
                    });
                },50);
            }
        }
    });

    self.toggle = function(){
        var isChecked = self.checked();
        self.checked(!isChecked);
    }

    try{
        self.price = data.price.toFixed(2);
    }
    catch (e){
        self.price = "-";
    }
}
function LowPricePresentSelector(){
    var self = this;
    self.allowedNumber = ko.observable(); //允许的数量
    self.presents = ko.observableArray();
    self.setPresentRecords = function(records){
        self.presents(records);
    };
    self.remainNumber = ko.computed(function(){
        var selNum = 0;
        $.each(self.presents(),function(idx,present){
            if(present.checked()){
                selNum+=present.selectedNumber();
            }
        });
        return self.allowedNumber() - selNum;
    });
    self.callback = null;
    self.show = function(presentRecords,allowedNumber,callBack){
        if(!presentRecords){
            return;
        }
        self.allowedNumber(allowedNumber);
        self.callback = callBack;
        self.setPresentRecords($.map(presentRecords,function(present){
            var r = new PresentRecord(present,self);
            return r;
        }));
        if($.layer && false){
            self.layerIndex = $.layer({
                    type:1,
                    title:"请选择换购商品,数量有限换完即止",
                    area:['600px','500px'],
                    offset:['100px',''],
                    page:{dom:'#lowPricePresentSelector'}
                }
            );
        }
        else{
            $("#lowPricePresentSelector").show(300);
        }

    }
    self.add = function(presentRecord){
        if(self.remainNumber()>0 && presentRecord.checked()){
            presentRecord.selectedNumber(Number(presentRecord.selectedNumber())+1);
        }

    }
    self.minus = function(presentRecord){
        if(presentRecord.checked() && presentRecord.selectedNumber()>1){
            presentRecord.selectedNumber(Number(presentRecord.selectedNumber())-1);
        }

    }
    self.ok = function(){
        var selectedPresents = [];
        $.each(self.presents(),function(idx,present){
            if(present.checked()){
                selectedPresents.push({
                    productId:present.productId,
                    skuId : present.skuId,
                    number:present.selectedNumber()
                })
            }
        });
        if($.layer){
            layer.close(self.layerIndex);
        }
        else{
            $("#lowPricePresentSelector").fadeOut(100);
        }

        if(self.callback){
            self.callback(selectedPresents);
        }

    }
    self.close = function(){
        $("#lowPricePresentSelector").fadeOut(100);
    }

}

var lowPricePresentSelector=null;
$(document).on("koInit",function(event,extraParams){
    var root = document.getElementById("lowPricePresentSelector");
    if(root){
        lowPricePresentSelector = new LowPricePresentSelector();
        ko.applyBindings(lowPricePresentSelector,root);
    }
});
/*
$(document).ready(function(){
    lowPricePresentSelector = new LowPricePresentSelector();
    ko.applyBindings(lowPricePresentSelector,document.getElementById("lowPricePresentSelector"));
});*/
