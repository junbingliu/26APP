/**
 * Created by Administrator on 2015-09-04.
 */
function ListProductsPage(){
    var self = this;
    self.combiProducts = ko.observableArray([]);
    self.keyword = ko.observable("");
    self.pager = new Pager();
    self.pager.displayNumber(10);
    self.pager.pageSize(50);
    self.pager.currentPage(0);
    self.mID=ko.observable(m);//后台登录账户id
    self.search = function(start,limit){
        $.post("server/searchMyProducts.jsx",{keyword:self.keyword(),m:m,start:start,limit:limit},function(ret){
            self.pager.total(ret.total);
            self.pager.setStart(start);
            self.combiProducts($.map(ret.combiProducts,function(p){
                if(p.createTime){
                    var d = new Date(p.createTime);
                    p.createTimeText = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                }
                else{
                    p.createTimeText = "";
                }
                if(p.lastModifiedTime){
                    var d = new Date(p.lastModifiedTime);
                    p.lastModifiedTimeText = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                }
                else{
                    p.lastModifiedTimeText = "";
                }
                if(p.priceRecs&&p.priceRecs.length>0){
                    for(var x=0;x< p.priceRecs.length;x++){
                        var value= p.priceRecs[x];
                        if(value.entityId=="c_101"){
                            p.priceTO=(value.price*1).toFixed(2);
                        }
                    }
                    if(!p.priceTo){
                        p.priceTO=( p.priceRecs[0].price*1).toFixed(2);
                    }
                }else{
                    p.priceTO="暂无价格";
                }
                p.checked = ko.observable(false);
                p.published = ko.observable(p.published);
                p.certified = ko.observable(p.certified);
                return p;
            }));


        },"json");
    };

    self.pager.callback = self.search;

    self.doSearch = function(){
        self.pager.total(0);
        self.pager.setStart(0);
        self.pager.currentPage(0);
        self.combiProducts([]);
        self.search(0,self.pager.pageSize());
    };

    self.deleteProducts = function(){
        var selectedIds = [];
        $.each(self.combiProducts(),function(idx,combiProduct){
            if(combiProduct.checked()){
                selectedIds.push(combiProduct.id);
            }
        });
        if(selectedIds.length==0){
            bootbox.alert("没有选择套餐");
            return;
        }
        //$.post("server/deleteMerchant.jsx",{ids:selectedIds.join(","),m:m},function(ret){
        //    if(ret.state=="ok"){
                $.post("server/deleteCombiProducts.jsx",{ids:selectedIds.join(","),m:m},function(ret){
                    console.log(JSON.stringify(ret));
                    if(ret.state=="ok"){
                        bootbox.alert("删除成功！数据存在一点的延迟，请稍后刷新。");
                        self.refresh();
                    }else{
                        bootbox.alert("试图删除其他商家的数据，没有权限！");
                    }
                },"JSON");
        //    }
        //},"JSON");
    };

    //商品上架
    self.upProducts = function(){
        var selectedIds = [];
        $.each(self.combiProducts(),function(idx,combiProduct){
            if(combiProduct.checked()){
                selectedIds.push(combiProduct.id);
            }
        });
        if(selectedIds.length==0){
            bootbox.alert("没有选择套餐");
            self.refresh();
            return;
        }
        $.post("server/addMerchant.jsx",{ids:selectedIds.join(","),m:m},function(ret){
            if(ret.state=="ok"){
                $.post("server/upCombiProducts.jsx",{ids:selectedIds.join(","),m:m},function(ret){
                    if(ret.state=="ok"){
                        bootbox.alert("上架成功！");
                        $.each(self.combiProducts(),function(idx,combiProduct){
                            if(combiProduct.checked()){
                                combiProduct.published("T");
                            }
                        })
                    }else{
                        bootbox.alert(ret.msg)
                    }
                },"JSON");
            }
        },"JSON");
    };

    //商品上架
    self.downProducts = function(){
        var selectedIds = [];
        $.each(self.combiProducts(),function(idx,combiProduct){
            if(combiProduct.checked()){
                selectedIds.push(combiProduct.id);
            }
        });
        if(selectedIds.length==0){
            bootbox.alert("没有选择套餐");
            return;
        }
        $.post("server/deleteMerchant.jsx",{ids:selectedIds.join(","),m:m},function(ret){
            if(ret.state=="ok"){
                $.post("server/downCombiProducts.jsx",{ids:selectedIds.join(","),m:m},function(ret){
                    if(ret.state=="ok"){
                        bootbox.alert("下架成功！");
                        $.each(self.combiProducts(),function(idx,combiProduct){
                            if(combiProduct.checked()){
                                combiProduct.published("F");
                            }
                        })
                    }else{
                        bootbox.alert(ret.msg)
                    }
                },"JSON");
            }
        },"JSON");
    };

    //商品审核通过
    self.certifyProducts = function(){
        var selectedIds = [];
        $.each(self.combiProducts(),function(idx,combiProduct){
            if(combiProduct.checked()){
                selectedIds.push(combiProduct.id);
            }
        });
        if(selectedIds.length==0){
            bootbox.alert("没有选择套餐");
            return;
        }
        $.post("server/certifyCombiProducts.jsx",{ids:selectedIds.join(","),m:m},function(ret){
            if(ret.state=="ok"){
                bootbox.alert("审核成功！");
                $.each(self.combiProducts(),function(idx,combiProduct){
                    if(combiProduct.checked()){
                        combiProduct.certified("T");
                    }
                })
            }else{
                bootbox.alert(ret.msg)
            }
        },"JSON");
    }

    //商品审核不通过
    self.rejectProducts = function(){
        var selectedIds = [];
        $.each(self.combiProducts(),function(idx,combiProduct){
            if(combiProduct.checked()){
                selectedIds.push(combiProduct.id);
            }
        });
        if(selectedIds.length==0){
            bootbox.alert("没有选择套餐");
            return;
        }
        $.post("server/rejectCombiProducts.jsx",{ids:selectedIds.join(","),m:m},function(ret){
            if(ret.state=="ok"){
                bootbox.alert("审核不通过操作成功！");
                $.each(self.combiProducts(),function(idx,combiProduct){
                    if(combiProduct.checked()){
                        combiProduct.certified("F");
                    }
                })
            }else{
                bootbox.alert(ret.msg)
            }
        },"JSON");
    };

    self.refresh = function(){
        self.pager.refresh();
        self.doSearch();
    };

    self.edit = function(combiProduct){
        var hash = "#/editCombiProduct/" + combiProduct.id;
        window.location.hash = hash;
    }
}

var listProductsPage = null;
$(function(){
    listProductsPage = new ListProductsPage();
    ko.applyBindings(listProductsPage,document.getElementById("listProductsPage"));
});