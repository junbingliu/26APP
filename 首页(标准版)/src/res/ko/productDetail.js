var ProductDetail=function(){
    var self=this;
    self.getQueryString=function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    //购买数
    self.buyAmount=ko.observable(onceMustBuyCount);
    self.skuSelector = new SkuSelector();
    self.skuSelector.skuSelectListener = function(skuId){
        $("#btnbuy").hide();
        $("#buyInfo").fadeIn();
        var postData = {
            productId:productId,
            skuId:skuId
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
    self.checkAmount=function(){
        var curAmount = self.buyAmount();
        var responseCount = jQuery.ajax({url:  "/shopping/handle/get_product_buy_count.jsp?dumy=" + Math.random(), data: {productId: productId, skuId: skuId}, async: false, cache: false}).responseText;
        var buycount = Number(nowStock - securitySellableCount - responseCount);
        var maxAmount = buycount;

        if (maxAmount < 0 || maxAmount < onceMustBuyCount) {
            maxAmount = 0;
        }

        if (curAmount == "" || isNaN(curAmount)) {
            self.showPrompt("您填写购买的商品数量不是有效的数字");
            self.buyAmount(onceMustBuyCount);
            return;
        }
        curAmount = Number(curAmount);
        if (curAmount > maxAmount) {
            if (responseCount > 0) {
                self.showPrompt("对不起，库存不足，您的购物车已有该商品" + responseCount + "件!");
            } else {
                self.showPrompt("对不起，库存不足!");
            }

            return;
        }
        var minAmount = 0;
        if (onceMustBuyCount <= maxAmount) {
            minAmount = onceMustBuyCount;
        }
        if (curAmount < minAmount) {
            self.showPrompt("购买数量不能低于：" + onceMustBuyCount + "件!");
            self.buyAmount(minAmount);
        }

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
    self.showPrompt=function(promptContent){
        //显示提示框
            $("#xj_msg_info").css("display", "block");
            $("#xj_msg_info_content").html(promptContent);
    }
    /* 关闭提示框*/
    self.closeDiv=function(){
        $("#xj_msg_info").css("display", "none");
        $("#xj_msg_info_content").html("");
    }
    /*end关闭提示框*/
    self.checkBuyForm=function() {
        if (self.checknumber(self.buyAmount())) {
            self.showPrompt("您填写购买的商品数量不是有效的数字");
            self.buyAmount(onceMustBuyCount);
            return false;
        } else {
            if(isNaN(self.buyAmount())){
                self.showPrompt("您填写购买的商品数量不是有效的数字");
                self.buyAmount(onceMustBuyCount);
                return false;
            }
            if (self.buyAmount() == "0") {
                self.showPrompt("购买的商品数量不能少于起订量");
                self.buyAmount(onceMustBuyCount);
                return false;
            }
            if (self.buyAmount() == "999" || self.buyAmount().length > 3) {
                self.showPrompt("尊敬的客户您订购的数量太多,请您与客服或与商家联系");
                return false;
            }
            if (self.skuSelector.selectedSkuId() == ""||self.skuSelector.selectedSkuId() == null) {
                self.showPrompt("请选择商品属性");
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
                        self.showPrompt("该商品不存在!");
                    } else if (data.error_code == "product_off_shelves") {
                        self.showPrompt("该商品已下架!");
                    } else if (data.error_code == "product_info_wrong") {
                        self.showPrompt("商品销售信息有误!");
                    } else if (data.error_code == "product_out_of_stock") {
                        self.showPrompt("商品库存不足!");
                    }else{
                        self.showPrompt("系统繁忙请稍候重试");
                    }
                }

            }
        })

    }
    self.add2Cart=function(){
        if(self.checkBuyForm()){
            var successCallBack=function(){
                self.showPrompt("加入购物车成功！");
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
