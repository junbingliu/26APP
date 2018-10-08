

$(function(){
    var deliveryLayer = $("#deliveryLayer");
    $(".orderInfo").on("click",".inputDelivery",function(){
        var selfObj = $(this);

        deliveryLayer.css({"left":(($(document.body).width() - deliveryLayer.width()) / 2) + "px","top":(selfObj.offset().top - deliveryLayer.height()/2)+"px"});
        deliveryLayer.show();
    });

    $("#deliverySubmitBtn").on("click",function(){
        var deliveryName = $("#deliveryName").val();
        var deliveryNo = $("#deliveryNo").val();
        if(deliveryNo == ""||deliveryName==""){
            alert("请输入快递单号和快递名称");
            return;
        }
        var params = {
            deliveryName:deliveryName,
            deliveryNo:deliveryNo,
            returnOrderId:$("#returnOrderId").val(),
            orderType:$("#returnOrderType").val()

        };
        $(this).attr("disabled","disabled");
        $.post("/"+rappId+"/handler/order_return_update_handler.jsx",params,function(resp){
            var resp = $.trim(resp);
            if (resp == "ok") {
                alert("添加快递单号成功");
                deliveryLayer.hide();
                $("#deliveryName").val("");
                $("#deliveryNo").val("");
                document.location.reload();
            }else if (resp == "system_error") {
                alert("系统繁忙");
                $("#deliverySubmitBtn").attr("disabled",false);
            }else if (resp == "notLogin") {
                window.location.href = '/login.html?rurl='+encodeURI(window.location.pathname+"?"+window.location.search);
                $("#deliverySubmitBtn").attr("disabled",false);
            }else{
                $("#deliverySubmitBtn").attr("disabled",false);
            }
        });
    });
});