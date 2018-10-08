
$(function(){
    var bindEmailForm = $("#bindEmailForm");
    var formValidate = bindEmailForm.validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
//                debug: true,
        rules: {
            email: {required: true,email: true}
        },
        messages: {
            email:{required:"请输入您的邮箱",email:"请检查您输入的邮箱地址"}
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
                url:"/" + rappId + "/handler/send_validate_email_handler.jsx",
                dataType:"json",
                //beforeSubmit: showRequest,
                success: function(response){
                    if(response.state){
                        $(form).resetForm();
                        var noteBlock = $(".bindAuthorize02");
                        var formBlock = $(".bindAuthorize01");
                        var textCenter = noteBlock.find("h2.textCenter");
                        textCenter.html(textCenter.text().replace("{showEmail}",response.email))
                        noteBlock.find("a.btnPrimary").attr("href",response.emailLoginLink);
                        formBlock.addClass("hide");
                        noteBlock.removeClass("hide");
                        //setTimeout(function(){
                        //    noteBlock.addClass("hide");
                        //    formBlock.removeClass("hide");
                        //},3000);
                    }else{
                        if(response.errorCode == "not_logged"){
                            document.location.href = "/login.html?rurl=" + requestURI;
                        }else if(response.errorCode == "email_empty"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("请输入邮箱地址。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else if(response.errorCode == "email_not_change"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("当前邮箱已验证，不需要重复验证。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else if(response.errorCode == "email_exist"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("对不起，此邮箱已注册。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else if(response.errorCode == "token_empty"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("提交参数异常。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else if(response.errorCode == "token_null"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("提交参数异常。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else if(response.errorCode == "token_error"){
                            var helpBlock = $(".errorText[for='email']",form);
                            helpBlock.html("请求异常，请重新再试。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.email.focus();
                        }else{
                            alert(response.errorCode);
                        }
                    }
                }
            });
        }
    });
});
