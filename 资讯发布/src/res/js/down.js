$(document).ready(function () {
    //下载模板
    var m = $("#merchantId").val();
    var importFileId = $("#importFileId");

    $(".down").click(function () {
        $.get("../handler/downExcel.jsx?m="+m,function (res) {
            if(res.state == "ok"){
                window.location = res.url;
            }else{
                alert(res.msg);
            }
        },"json");
    });

    $("#submit_form").click(function () {
        var importFileId = document.querySelector("input[type=file]").value;
        if(importFileId != ""){
            setTimeout(function(){
                window.location.href = "uploadLog.jsx?m=" + m;
            },2000);
        }
    });

    //覆盖和跳过
    $("body").on("click",".onRadioState",function(){
        var radioState = $('input[name="radioState"]:checked').val();
        $(".radioStateValue").val(radioState);

    });

});