/**
 * Created by mkz on 15/6/9.
 */

$(function(){

    var bindCardForm = $("#bindCardForm");
    var formValidate = bindCardForm.validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
        debug: true,
        rules: {
            cardNo: {required: true},
            cardPwd: {required: true}
        },
        messages: {
            cardNo:{required:"请输入兑换码"},
            cardPwd:{required:"请输入密码"}
        },
        invalidHandler: function (event, validator) { //display error alert on form submit

        },
        highlight: function (element) { // hightlight error inputs
            $(element).parent().addClass('has-error'); // set error class to the control group
        },
        unhighlight: function (element) { // revert the change done by hightlight
            var formGroup = $(element).parent();
            formGroup.removeClass('has-error');
        },
        errorPlacement: function(error, element) {
            error.appendTo(element.parent());
        },
        success: function (label) {
            label.parent().removeClass('has-error'); // set success class to the control group
        },
        submitHandler: function (form) {
            $(form).ajaxSubmit({
                type:"post",
                url:"/" + rappId + "/handler/coupon_bind_handler.jsx",
                dataType:"json",
                beforeSubmit: function(){
                    //layer.msg("系统正在绑定预付卡中，请等待",{shade: [0.3, '#393D49']});
                },
                success: function(response){
                    if(response.state == "10"){
                        document.locatioin.href = "/login.html?rurl=" + window.location.pathname;
                        return;
                    }else if(response.state == "1" || response.state == "2"){
                        //layer.closeAll();
                        alert(response.msg);
                        document.location.reload();
                    }else if(response.state == "0"){
                        //layer.closeAll();
                        alert("兑换成功，请登录“我的优惠券”查看。");
                        document.location.reload();
                    }else{
                        //layer.closeAll();
                        alert(response.msg);
                    }

                }
            });
        }
    });

    $("#bindNewBtn").on("click",function(){
        $("#myCardCont").show();
    });

    $("#bindCardSubmit").on("click",function(){
        bindCardForm.submit();
    });
    $("#bindCardCancel").on("click",function(){
        formValidate.resetForm();
        formValidate.hideErrors();
        $("#myCardCont").hide();
    });


});
