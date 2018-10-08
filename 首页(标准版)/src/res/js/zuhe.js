
$(document).ready(function(){
    $(".zuhe .next").click(function(){
        var target=$(this).parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        if((imgCount+Number(offset))>5) {
            target.css("left", (offset - 1) * 150 + "px");
            offset = offset - 1;
            target.attr({offset: offset});
        }
    })
    $(".zuhe .prev").click(function(){
        var target=$(this).parent().find("ul");
        var offset=target.attr("offset")||0;
        var imgCount=target.find("li").length;
        offset = Number(offset) + 1;
        if((offset)<1) {
            target.css("left", offset * 150 + "px");
            target.attr({offset: offset});
        }
    })
    //最佳搭配累加
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
    var selectCount=1;
    var totalPrice=$(".promote .base input[name='memberPrice']").val();
    var productItem=[];//勾选得商品id数组
    productItem.push($(".promote .base input[name='id']").val());
    $(".promote :checkbox").click(function(){
        var memberPrice=$(this).parent().parent().find("input[name='memberPrice']").val();
        var id=$(this).parent().parent().find("input[name='id']").val();
        if($(this).attr("checked")=="checked"){
            totalPrice=Number(memberPrice)+Number(totalPrice);
            selectCount++;
            productItem.push(id);
        }else{
            if($.inArray(id, productItem>0)){
                totalPrice=Number(totalPrice)-Number(memberPrice);
                selectCount--;
                productItem.remove(id);
            }
        }
        $(".zuhe .total .totalPrice").html("¥"+totalPrice.toFixed(2));
        $(".zuhe .total .zuhecheckCount").html(selectCount);
    });
    var submitCart=function(params,callback){
        $.post("/shopping/handle/cart_add_handler.jsp",params,function(data){
            if(data.indexOf("ok")<0){
                data=JSON.parse(data);
                if(!data.state) {
                    if (data.error_code == "product_not_exist") {
                        errorMessages.push(params.id+":商品不存在");
                    } else if (data.error_code == "product_off_shelves") {
                        errorMessages.push(params.id+":商品已下架!");
                    } else if (data.error_code == "product_info_wrong") {
                        errorMessages.push(params.id+":商品销售信息有误!");
                    } else if (data.error_code == "product_out_of_stock") {
                        errorMessages.push(params.id+":商品库存不足!");
                    } else {
                        errorMessages.push(params.id+":加入购物车失败,未知错误!"+data.error_code);
                    }
                }
            }
            if(callback){
                callback();
            }


        })
    }
    var check=function(num){
        var reg=/^[1-9]\d*$|^0$/;
        if(reg.test(num)==true){
            return true;
        }else{
            return false;
        }
    }

    var addToCart=function(callback){
        var amount=$("#zuheCount").val();
        if(!check(amount)){
            alert("请填写正确得购买数！");
            return;
        }
        var params={};
        params.id=productItem[0];
        params.amount=amount;
        params.relationType="combination";
        params.isSome=1;
        var destObjIds="";
        for(var i=0;i<productItem.length;i++){
            destObjIds=productItem[i]+","+destObjIds;
        }
        params.destObjIds=destObjIds;
        submitCart(params,callback);
    }
    var errorMessages=[];
    //人气组合立刻购买
    $(".promote .conts #btnzuhe").click(function(){
        var callback=function(){
            if(errorMessages.length>0){
                alert(errorMessages);
            }
            errorMessages=[];
            window.location.href="/cart.html";
        }
        addToCart(callback);
    });

    //套餐立即购买
    $(".promote .conts #btntaocan").click(function(){
        var callback=function(){
            if(errorMessages.length>0){
                alert(errorMessages);
            }
            errorMessages=[];
            window.location.href="/cart.html";
        }
        var params={};

        params.merchantId=$(this).parent().find("#merchantId").val();
        params.id=$(this).parent().find("#id").val();
        params.histroyColumnId=$(this).parent().find("#histroyColumnId").val();
        submitCart(params,callback);
    })
})