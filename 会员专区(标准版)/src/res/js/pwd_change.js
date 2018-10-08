/**
 * Created by mk on 2015-03-15.
 */

$(function(){
    var pwdForm = $("#pwdForm");
    var formValidate = pwdForm.validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
//                debug: true,
        rules: {
            oldPwd: {required: true,rangelength:[6,20]},
            newPwd: {required: true,rangelength:[6,20]},
            confirm_newPwd: {required: true,rangelength:[6,20],equalTo: "input[name='newPwd']"}
        },
        messages: {
            oldPwd:{required:"请输入当前密码",rangelength:"密码设置支持6-20位字母、符号或数字，密码区分大小写"},
            newPwd:{required:"请设置您的新密码",rangelength:"密码设置支持6-20位字母、符号或数字，密码区分大小写"},
            confirm_newPwd:{required:"请确认密码",rangelength:"密码设置支持6-20位字母、符号或数字，密码区分大小写",equalTo:"两次输入密码不一致，请再次输入"}
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
                url:"/" + rappId + "/handler/pwd_change_handler.jsx",
                dataType:"json",
                //beforeSubmit: showRequest,
                success: function(response){
                    if(response.state){
                        $(form).resetForm();
                        var noteBlock = $(".bindAuthorize02");
                        var formBlock = $(".bindAuthorize01");
                        formBlock.addClass("hide");
                        noteBlock.removeClass("hide");
                        setTimeout(function(){
                            noteBlock.addClass("hide");
                            formBlock.removeClass("hide");
                            //document.location.reload();
                        },3000);
                    }else{
                        if(response.errorCode == "not_logged"){
                            document.location.href = "/login.html?rurl=" + requestURI;
                        }else if(response.errorCode == "param_error"){

                        }else if(response.errorCode == "login_failed"){
                            var helpBlock = $(".errorText[for='oldPwd']",form);
                            helpBlock.html("您输入的当前密码错误，请检查您的输入。");
                            helpBlock.parent(".formGroup").addClass("has-error");
                            form.oldPwd.focus();
                        }else{
                            alert(response.errorCode);
                        }
                        $(form).resetForm();

                    }
                }
            });
        }
    });

});
