
$(function(){
    var formValidate = $("#resetPwdForm").validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
//                debug: true,
        rules: {
            password: {required: true,rangelength:[6,20]},
            password_confirm: {required: true,rangelength:[6,20],equalTo: "input[name='password']"}
        },
        messages: {
            password:{required:"请设置您的密码",rangelength:"密码设置支持6-20位字母、符号或数字，密码区分大小写"},
            password_confirm:{required:"请确认密码",rangelength:"密码设置支持6-20位字母、符号或数字，密码区分大小写",equalTo:"两次输入密码不一致，请再次输入"}
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
            form.submit();
        }
    });
});