var ProductDetail=function(){
    var self=this;
    self.getQueryString=function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    //购买数
    self.buyAmount=ko.observable(1);
    self.skuSelector = new SkuSelector();
    self.skuSelector.skuSelectListener = function(skuId){
        $("#btnbuy").hide();
        $("#buyInfo").fadeIn();
        var postData = {
            productId:productId,
            skuId:skuId,
            merchantId:merchantId,
            userId:userId
        }
        $.post("/" + rappId +"/serverHandler/getSellableCount.jsx",postData,function(ret){
            if(ret.state=='ok' && ret.skuId==skuId){
                if(ret.sellableCount>0){
                    $("#buyInfo").hide();
                    $(".btnbuy").show();
                    $("#btnNotification").hide();
                }
                else{
                    $("#buyInfo").hide();
                    $(".btnbuy").hide();
                    $("#btnNotification").show();
                }
            }
            else{
                $("#buyInfoMsg").text("出错了！检查是否有库存出错。")
            }
        },"json");
        $.post("/"+rappId+"/serverHandler/getPriceBySkuId.jsx",postData,function(ret){
            if(ret.state=="ok"&&ret.price!=0){
                console.log(ret.price);
                $(".summary .price strong").html("&yen"+(ret.price/100).toFixed(2));
            }
        },"json")

    }
    self.add=function(){
        var newAmount=Number(self.buyAmount())+1;
        self.buyAmount(newAmount);
    }

    self.decrease=function(){
        var newAmount=Number(self.buyAmount())-1;
        if(newAmount==0){
            return;
        }
        self.buyAmount(newAmount);
    }
    self.checknumber=function(strs) {
        var Letters = "1234567890";
        var i;
        var c;
        for (i = 0; i < strs.length; i ++) {
            c = strs.charAt(i);
            if (Letters.indexOf(c) == -1) {
                return true;
            }
        }
        return false;
    }
    self.checkBuyForm=function() {
        if (self.checknumber(self.buyAmount())) {
            alert("您填写购买的商品数量不是有效的数字");
            self.buyAmount(1);
            return false;
        } else {
            if(isNaN(self.buyAmount())){
                alert("您填写购买的商品数量不是有效的数字");
                self.buyAmount(1);
                return false;
            }
            if (self.buyAmount() == "0") {
                alert("购买的商品数量必须大于0");
                self.buyAmount(1);
                return false;
            }
            if (self.buyAmount() == "999" || self.buyAmount().length > 3) {
                alert("尊敬的客户您订购的数量太多,请您与客服或与商家联系");
                return false;
            }
        }
        return true;
        //获取该商品购物车数量
//        var responseCount = jQuery.ajax({url:"/shopping/handle/get_product_buy_count.jsp?dumy=" + Math.random(),data:{productId:self.getQueryString("id")},async:false,cache:false}).responseText;
//        responseCount = Number(jQuery.trim(responseCount));
    }
    self.submitCartForm=function(successCallBack,failCallBack){
        var params={};
        params.id=self.getQueryString("id");
        params.amount=self.buyAmount();
        params.skuId= self.skuSelector.selectedSkuId();
        $.post("/shopping/handle/cart_add_handler.jsp",params,function(data){
            if(data.indexOf("ok")>-1){
                successCallBack();
            }else{
                data=JSON.parse(data);
                if(!data.state) {
                if (data.error_code == "product_not_exist") {
                    alert("该商品不存在!");
                } else if (data.error_code == "product_off_shelves") {
                    alert("该商品已下架!");
                } else if (data.error_code == "product_info_wrong") {
                    alert("商品销售信息有误!");
                } else if (data.error_code == "product_out_of_stock") {
                    alert("商品库存不足!");
                }else{
                    alert("加入购物车失败,未知错误!"+data.error_code);
                }
                }
                failCallBack();
            }
        })

    }
    self.add2Cart=function(){
        if(self.checkBuyForm()){
            var successCallBack=function(){
                alert("加入购物车成功！");
            }
            self.submitCartForm(successCallBack);
        }
    }
    self.buyNow=function(){
        if(self.checkBuyForm()){
            var successCallBack=function(){
                window.location.href="/cart.html";
            }
            self.submitCartForm(successCallBack);
        }
    }
}
var productDetail = null;
$(function(){
    productDetail = new ProductDetail();
    productDetail.skuSelector.init(skus,inventoryAttrs);
    ko.applyBindings(productDetail);
});
