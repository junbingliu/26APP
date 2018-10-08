/**
 * Created by mk on 2015-04-15.
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
            cardNo:{required:"请输入万家预付卡/礼品卡的卡号"},
            cardPwd:{required:"请输入万家预付卡/礼品卡的密码"}
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
                url:"/" + rappId + "/handler/store_card_bind_handler.jsx",
                dataType:"json",
                beforeSubmit: function(){
                    layer.msg("系统正在绑定预付卡中，请等待",{shade: [0.3, '#393D49']});
                },
                success: function(response){
                    if(response.state == "10"){
                        document.locatioin.href = "/login.html?rurl=" + window.location.pathname;
                        return;
                    }else if(response.state == "1" || response.state == "2"){
                        layer.closeAll();
                        alert(response.msg);
                        document.location.reload();
                    }else if(response.state == "0"){
                        layer.closeAll();
                        alert("绑定成功，已赠送您优惠券，请登录“我的优惠券”查看。");
                        document.location.reload();
                    }else{
                        layer.closeAll();
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

    var modifyLayer = $("#modifyCardPwdLayer");
    modifyLayer.on("click", ".closeBtn", function () {
        modifyLayer.hide();
    });
    $(".myCardList").on("click",".modifyPwdBtn",function(){
        var selfObj = $(this);
        var cardNo = selfObj.parent().siblings().eq(0).html();

        modifyLayer.html(template("modifyCardPwdTemplate",{cardNo:cardNo})).css({
            "left": (($(document.body).width() - modifyLayer.width()) / 2) + "px",
            "top": $(document).scrollTop() + 100 + "px"
        }).show();

        var modifyForm = $("#modifyCardPwdForm");
        var formValidate = modifyForm.validate({
            errorElement: 'small',
            errorClass: 'errorText',
            focusInvalid: false,
            ignore: "",
            debug: true,
            rules: {
                cardNo: {required: true},
                cardPwd: {required: true},
                cardNewPwd: {required: true},
                cardNewPwd2: {required: true,equalTo: "input[name='cardNewPwd']"}
            },
            messages: {
                cardNo:{required:"请输入预付卡/礼品卡的卡号"},
                cardPwd:{required:"请输入预付卡/礼品卡的原密码"},
                cardNewPwd:{required:"请输入新密码"},
                cardNewPwd2:{required:"请确认密码",equalTo:"两次填写的密码不一致"}
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
                    url:"/" + rappId + "/handler/store_card_modify_pwd_handler.jsx",
                    dataType:"json",
                    beforeSubmit: function(){
                        layer.msg("系统正在修改密码中，请等待",{shade: [0.3, '#393D49']});
                    },
                    success: function(response){
                        if(response.state == "10"){
                            document.locatioin.href = "/login.html?rurl=" + window.location.pathname;
                            return;
                        }else if(response.state == "0"){
                            layer.closeAll();
                            alert(response.msg);
                        }else{
                            layer.closeAll();
                            alert(response.msg);
                        }
                    }
                });
            }
        });

        $("#modifyCardPwdSubmit",modifyForm).on("click",function(){
            modifyForm.submit();
        });
        $("#modifyCardPwdCancel",modifyForm).on("click",function(){
            modifyLayer.html("");
            modifyLayer.hide();
        });
    });

});