/**
 * Created by Administrator on 2014/6/11.
 */

var BuyFlowUtils = {
    pendingItems:[],
    selectProducts : function(){
        productSelector.openSelectProductView(function(selectedItems){
            var items = ko.mapping.toJS(selectedItems);

            var pendingItems = [];
            //遍历items,如果没有多sku的情况，则加入购物车
            items.forEach(function(item){
                if(item.hasMultiSkus){
                    pendingItems.push(item);
                }
                else{
                    var params = {productId:item.id}
                    $.post(AppConfig.url+"server/addToCart.jsx",params,function(ret){
                        if(ret.state=='ok'){
                            cartsPage.loadCarts();
                        }
                        else{
                            layer.alert("出错了！" + ret.msg);
                        }

                    },"JSON");
                }
                BuyFlowUtils.pendingItems = pendingItems;
                if(BuyFlowUtils.pendingItems.length>0){
                    BuyFlowUtils.resolvePendingItems();
                }
            });
        });
    },

    resolvePendingItems:function() {
        if(BuyFlowUtils.pendingItems.length>0){
            var item = BuyFlowUtils.pendingItems.shift();
            BuyFlowUtils.selectSkus(item.id,item.name);
        }
    },
    addToCart:function(productId,skuId){
        var params = {productId:productId,skuId:skuId};
        $.post(AppConfig.url+"server/addToCart.jsx",params,function(ret){
            if(ret.state=='ok'){
                cartsPage.loadCarts();
            }
            else{
                layer.alert("出错了。" + ret.msg);
            }

        },"JSON");
    },
    selectSkus:function (productId,productName){
        $.post(AppConfig.url+"server/getSkus.jsx",{id:productId},function(ret){
            if(ret.state=='ok'){
                if(ret.skus.length==1){
                    var sku = ret.skus[0];
                }
                else{
                    skuSelectorDialog.init(ret.skus,ret.inventoryAttrs,function(skuId){
                        BuyFlowUtils.addToCart(productId,skuId);
                        BuyFlowUtils.resolvePendingItems();
                    });
                    skuSelectorDialog.open(productName);
                }
            }
            else{
                layer.alert("出错了！" + ret.msg);
            }
        },"JSON");
    },
    selectSkuEx:function (productId,productName,callback){
        $.post(AppConfig.url + AppConfig.getSkusUrl,{id:productId},function(ret){
            if(ret.state=='ok'){
                if(ret.skus.length==1){
                    var sku = ret.skus[0];
                }
                else{
                    skuSelectorDialog.init(ret.skus,ret.inventoryAttrs,function(skuId){
                       callback(skuId);
                    });
                    skuSelectorDialog.open(productName);
                }
            }
            else{
                layer.alert("出错了！" + ret.msg);
            }
        },"JSON");
    }
};
/**
 * 删除左右两端的空格
 */
String.prototype.trim=function(){
    return this.replace(/(^\s*)|(\s*$)/g, '');
};