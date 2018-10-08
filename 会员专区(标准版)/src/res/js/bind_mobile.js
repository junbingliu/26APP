
$(function(){
    var timer = 0;
    var bindMobileForm = $("#bindMobileForm");
    jQuery.validator.addMethod("mobile", function (value, element) {
        var length = value.length;
        var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        return  this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码");
    var formValidate = bindMobileForm.validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
//                debug: true,
        rules: {
            mobile: {required: true,mobile: true},
            code:{required: true}
        },
        messages: {
            mobile:{required:"请输入您的手机号码",mobile:"请检查您输入的手机号码"},
            code:{required:"请输入验证码"}
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
                url:"/" + rappId + "/handler/bind_mobile_validate_handler.jsx",
                dataType:"json",
                //beforeSubmit: showRequest,
                success: function(response){
                    if(response.state){
                        $(form).resetForm();
                        var formBlock = $(".bindAuthorize01");
                        var noteBlock = $(".bindAuthorize02");
                        formBlock.addClass("hide");
                        noteBlock.removeClass("hide");
                        setTimeout(function(){
                            noteBlock.addClass("hide");
                            formBlock.removeClass("hide");
                        },3000);
                        var getCodeBtn = $("#getValidationCode");
                        getCodeBtn.html("获取验证码");
                        getCodeBtn.removeAttr("disabled");
                        clearInterval(timer);
                        getCodeBtn.parent().find("small.errorText").html("");
                        form.mobile.value = response.mobile;
                    }else{
                        if(response.errorCode == "not_logged"){
                            document.location.href = "/login.html?rurl=" + requestURI;
                        }else if(response.errorCode == "mobile_empty"){
                            var helpBlock = $(".errorText[for='mobile']",form);
                            helpBlock.html("请输入手机号码。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.mobile.focus();
                        }else if(response.errorCode == "code_empty"){
                            var helpBlock = $(".errorText[for='code']",form);
                            helpBlock.html("请输入验证码。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.code.focus();
                        }else if(response.errorCode == "mobile_not_change"){
                            var helpBlock = $(".errorText[for='mobile']",form);
                            helpBlock.html("当前手机已验证，不需要重复验证。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.mobile.focus();
                        }else if(response.errorCode == "mobile_exist"){
                            var helpBlock = $(".errorText[for='mobile']",form);
                            helpBlock.html("对不起，此手机已注册。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.mobile.focus();
                        }else if(response.errorCode == "validateCode_not_exist" || response.errorCode == "link_invalid" || response.errorCode == "validateCode_error"){
                            var helpBlock = $(".errorText[for='mobile']",form);
                            helpBlock.html("验证码错误。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.code.focus();
                        }else if(response.errorCode == "has_verified"){
                            var helpBlock = $(".errorText[for='mobile']",form);
                            helpBlock.html("当前手机已验证通过，不需要重复验证。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.mobile.focus();
                        }else{
                            alert(response.errorCode);
                        }
                    }
                }
            });
        }
    });

    $("#getValidationCode").on("click",function(){
        var self = $(this),parent = self.parent(".formGroup");
        if(self.attr("disabled") == "disabled"){
            return;
        }

        var helpBlock = parent.find(".errorText");
        if(!helpBlock || helpBlock.length == 0){
            helpBlock = $('<small class="errorText"></small>');
            helpBlock.appendTo(parent);
        }
        parent.removeClass("has-error");
        helpBlock.html("");

        var mobile = $("input[name='mobile']",bindMobileForm);
        if(mobile.val() == ""){
            parent.addClass("has-error");
            helpBlock.html("请输入您要绑定的手机号码");
            return;
        }

        $.get("/" + rappId + "/handler/send_validate_msg_handler.jsx",{mobile:mobile.val(),t:Math.random(),token:$("input[name='token']",bindMobileForm).val()},function(resp){
            if(resp.state){
                helpBlock.html("验证码已发出，请注意查收短信。");
                self.attr("disabled","disabled");
                var timeOut = 120;//秒
                self.html((--timeOut)+"秒");
                timer = setInterval(function(){
                    timeOut--;
                    self.html(timeOut+"秒");
                    if(timeOut <=0){
                        clearInterval(timer);
                        self.html("获取验证码");
                        self.removeAttr("disabled");
                    }
                },1000);

            }else{
                var msg = "";
                if(resp.errorCode == "not_logged"){
                    document.location.href = "/login.html?rurl=" + requestURI;
                    return;
                }else if(resp.errorCode == "mobile_empty"){
                    helpBlock.html("请输入您要绑定的手机号码。");
                }else if(resp.errorCode == "mobile_not_change"){
                    helpBlock.html("当前手机已验证，不需要重复验证。");
                }else if(resp.errorCode == "mobile_exist"){
                    helpBlock.html("对不起，此手机已注册。");
                }else if(resp.errorCode == "please_wait"){
                    helpBlock.html("您的验证码还在有效期，请不要重复验证。");
                }else{
                    alert(resp.errorCode);
                }


                //helpBlock.html(msg);
                parent.addClass("has-error");
            }
        },"json");
    });


});
