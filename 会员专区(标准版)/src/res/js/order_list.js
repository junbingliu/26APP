

$(function(){




    var myOrder = $(".myOrder");
    //$("#searchBtn",myOrder).on("click",function(){
    //    var self = $(this);
    //    var keyword = self.prev("input").val();
    //    var url = window.location.pathname;
    //    if(keyword != ""){
    //        //var searchParams = window.location.search;
    //        //if(searchParams && searchParams != ""){
    //        //    url += searchParams + "&";
    //        //}else{
    //        //    url += "?"
    //        //}
    //        url += "?orderKeyword=" + encodeURI(keyword);
    //        document.location.href = url;
    //    }else{
    //        document.location.href = url;
    //    }
    //});

    $("#orderSearchForm").submit(function(){
        var keywordObj = $("input[name='orderKeyword']",this);
        var keywordVal = keywordObj.val();
        var checkResult = true;
        var pattern = /[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
        for (var i = 0; i < keywordVal.length; i++) {
            var val = keywordVal[i];
            if(pattern.test(val)){
                checkResult = false;
                break;
            }
        }
        if(!checkResult){
            alert("关键字包含非法字符，请检测输入。");
            keywordVal.focus();
            return false;
        }
    });


    var loginId = window.loginId;
    var orderLayer = $("#orderLayer");
    $(".cancelOrderBtn").on("click",function(){
        var selfObj = $(this);
        var orderId = selfObj.closest(".myOrderTable").attr("orderId");
        orderLayer.html(template("cancelLayerTemplate",{orderId:orderId,loginId:loginId}));
        orderLayer.css("width","600px");
        var bodyObj = $(document.body)
        orderLayer.css({"left":((bodyObj.width() - orderLayer.width()) / 2) + "px","top":$(document).scrollTop()+150+"px"});
        orderLayer.fadeIn("normal");

        $("#cancelForm",orderLayer).ajaxForm({
            type:"post",
            url:"/" + rappId + "/handler/order_state_update_handler.jsx",
            dataType:"json",
            beforeSubmit: function(){
                if($(":radio[name='refundReason']:checked","#cancelForm").length == 0){
                    $("#cancelForm .showMsg",orderLayer).html("请选择取消订单原因");
                    return false;
                }
                $("input:submit","#cancelForm").attr("disabled","disabled")
            },
            success: function(resp){
                if(resp.state){
                    document.location.reload();
                }else{
                    var msg = "";
                    if(resp.errorCode == "not_logged" || resp.errorCode == "unlawful_action"){
                        document.location.href = "/login.html?rurl=" + encodeURI("/ucneter/order_list.html");
                        return;
                    }else if(resp.errorCode == "params_error"){
                        msg = "请求参数错误";
                    }else if(resp.errorCode == "user_not_exist"){
                        msg = "抱歉，当前登录用户不存在或已被删除";
                    }else if(resp.errorCode == "user_not_enable"){
                        msg = "抱歉，当前登录用户已被冻结，请与客服联系。";
                    }else if(resp.errorCode == "has_cancelled"){
                        msg = "该订单已被取消，不能重复操作。";
                    }else if(resp.errorCode == "can_not_cancel"){
                        msg = "抱歉，当前订单不能取消，如需取消订单请联系客服人员。";
                    }else if(resp.errorCode == "can_not_cancel2"){
                        msg = "抱歉，订单状态转换规则不允许这样的状态转换。";
                    }

                    $("#cancelForm .showMsg",orderLayer).html(msg);
                    $("input:submit","#cancelForm").removeAttr("disabled")
                }
            }
        });
    });

    orderLayer.on("click",".closeBtn",function(){
        orderLayer.hide();
    });

    $(".payOrderBtn").on("click",function(){
        var selfObj = $(this);
        var orderId = selfObj.closest(".myOrderTable").attr("orderId");
        $.get("/ucenter/payment_list.html",{orderId:orderId,tt:Math.random()},function(resp){
            orderLayer.html(resp);
            orderLayer.css("width","900px");
            orderLayer.css({"left":(($(document.body).width() - orderLayer.width()) / 2) + "px","top":$(document).scrollTop()+150+"px"}).fadeIn("normal");
        });
    });

});
