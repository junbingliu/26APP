//与属性相关的类，方法等等
function StandardValue(sv){
    var self = this;
    self.id = ko.observable(sv.id);
    self.name = ko.observable(sv.name);
    self.value = ko.observable(sv.value);
    self.selected = ko.observable(false);
    self.enabled = ko.observable(false);
}

function InventoryAttr(inventoryAttr){
    var self = this;
    self.name = ko.observable(inventoryAttr.name);
    self.type = ko.observable(inventoryAttr.type);
    self.id = ko.observable(inventoryAttr.id);
    self.userOperation = ko.observable(inventoryAttr.userOperation);

    var svs = inventoryAttr.standardValues.map(function(sv){
        return new StandardValue(sv);
    });

    self.standardValues = ko.observableArray(svs);
    self.getSelectedValue = function(){
        for(var i=0; i<self.standardValues().length; i++){
            var sv = self.standardValues()[i];
            if(sv.selected()){
                return sv.id();
            }
        }
        return null;
    }
}


function Sku(sku){
    var self = this;
    self.id = ko.observable(sku.id);
    self.skuId = ko.observable(sku.skuId);
    self.isHead = ko.observable(sku.isHead);
    self.attrs =sku.attrs;
}

function SkuSelector(){
    var self = this;
    self.inventoryAttrs = ko.observableArray();
    self.skus = ko.observableArray();
    self.init = function(skus,inventoryAttrs){
        self.skus([]);
        if(skus){
            self.skus (skus.map(function(sku){
                return new Sku(sku);
            }));
        }

        self.inventoryAttrs([]);
        if(inventoryAttrs){
            self.inventoryAttrs (inventoryAttrs.map(function(attr){
                return new InventoryAttr(attr);
            }));
        }
        self.enableAttrs();
    }

    self.getInventoryAttr = function(attrId){
        for(var i=0; i<self.inventoryAttrs().length; i++){
            var attr = self.inventoryAttrs()[i];
            if(attr.id()==attrId){
                return attr;
            }
        }
        return null;
    }

    self.selectedSkuId = function(){
        if(self.skus().length==1){
            return self.skus()[0].id;
        }
        for(var i=0; i<self.skus().length; i++){
            var sku = self.skus()[i];
            if(!sku.attrs || sku.isHead()){
                continue;
            }
            var isMatch = true;
            for(k in sku.attrs){
                var attrId = k;
                var attrValue = sku.attrs[k];
                var inventoryAttr = self.getInventoryAttr(attrId);
                if(!inventoryAttr){
                    isMatch = false;
                    break;
                }
                if(!inventoryAttr.getSelectedValue() ||  inventoryAttr.getSelectedValue()!=attrValue){
                    isMatch = false;
                    break;
                }
            }
            if(isMatch){
                return sku.id();
            }
        }
        return null;
    };

    /*private*/
    self.getValidSkus= function(curAttrId){
        //获得已经选过的属性以后，还能满足条件的所有 skus,排除curAttrId
        var leftSkus = self.skus();
        var validSkus = [];
        self.inventoryAttrs().forEach(function(inventoryAttr){
            if(inventoryAttr.id()==curAttrId){
                return;
            }
            var v = inventoryAttr.getSelectedValue();
            if(!v){return;}
            leftSkus.forEach(function(sku){
                if(sku.attrs && sku.attrs[inventoryAttr.id()] && sku.attrs[inventoryAttr.id()]==v){
                    validSkus.push(sku);
                }
            });
            leftSkus = validSkus;
            validSkus = [];
        });
        return leftSkus;
    }
    self.enableAttrs = function(){
        self.inventoryAttrs().forEach(function(inventoryAttr){
            var curAttrId = inventoryAttr.id();
            var skus = self.getValidSkus(curAttrId);
            inventoryAttr.standardValues().forEach(function(sv){
                //遍历每个剩下的sku,如果某个sku有这个属性，则这个属性可以enable
                sv.enabled(false);
                for(var i=skus.length-1; i>=0; i--){
                    var sku = skus[i];
                    if(!sku.attrs){
                        continue;  //这是 headSku
                    }
                    var v = skus[i].attrs[curAttrId];
                    if(sv.id() == v){
                        sv.enabled(true);
                    }
                }
            });
        });
    }
    self.selectValue = function(sv,attr){
        if(sv.enabled()==false){
            return;
        }
        attr.standardValues().forEach(function(curSv){
            curSv.selected(false);
        });
        sv.selected(true);
        self.enableAttrs();
    }

    self.shouldChooseSku= ko.computed(function(){
        if(self.skus().length>1){
            return true;
        }
        else{
            return false;
        }
    });



}