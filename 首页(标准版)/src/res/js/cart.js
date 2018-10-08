var getCart=function(){
    var time = (new Date()).getTime();
    $.get("/appMarket/appEditor/getCart.jsp",{t:time},function(data){
        var totalNumber = 0;
        var totalPrice = 0;
        var items = [];
        if(data.state=="ok"){
            $.each(data.oc,function(i,cartData){
                if(cartData.cartType!="common"){
                    return;
                };
                $.each(cartData.buyItems,function(j,item){
                    totalNumber += Number(item.number);
                    totalPrice += Number(item.totalPayPrice);
                    var unitPrice = item.unitPrice;
                    item.unitPrice = unitPrice;
                    items.push(item);
                });
            });
            $(".shopping_amount").html(totalNumber);
            var data = {
                buyItems:items,
                totalNumber:totalNumber,
                totalPrice:totalPrice.toFixed(2)
            };
            if(data.totalNumber>0){
                var tpl = $("#cartLayerTemplate").html();
                var html = juicer(tpl, data);
                $(".cartLayer").html(html);
            }else{
                $(".cartLayer").html("<p>您的购物车是空的,<br />快挑选喜欢的商品加入购物车吧</p>").addClass("cartEmpty");
            }
        }
        else{
            $(".cartLayer").html("<p>您的购物车是空的,<br />快挑选喜欢的商品加入购物车吧</p>").addClass("cartEmpty");
        }
        $(".topCart").mouseenter(function(){
            $(".cartLayer").show();
        }).mouseleave(function(){
                $(".cartLayer").hide();
            });
    },"json");
};
$(document).ready(function(){
    getCart();
    $(".topCart_link").mouseenter(function(){
        getCart();
    })
    $("body").on("click",".del",function(){
        var itemId=$(this).nextAll("input[name='itemId']").val();
        var cartId=$(this).nextAll("input[name='cartId']").val();
        var data={itemId:itemId,cartId:cartId};
        $.post("/shopping/handle/new/deleteCartItem.jsp",data,function(){
            getCart();
        });
    });
    $("body").on("click","#laterOn",function(){
        setTimeout(getCart,2000);
    })

});
