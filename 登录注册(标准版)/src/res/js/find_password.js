var FindPwd = function(){
    var pageBlock = $("#page_block");
    var flushCaptcha;
    var handleForm = function(){
        pageBlock = $("#page_block");
        var self = this;
        if(window.result && window.result.step == "2"){
            if(window.result.type == "email"){
                pageBlock.html(template("step2_email_template",window.result));
            }else if(window.result.type == "mobile"){
                pageBlock.html(template("step2_mobile_template",window.result));
            }
            $(".ProgressBar li:eq(1)").addClass("activeTwo").prev().attr("class","activeOne");;
        }else{
            pageBlock.html(template("step1_template",{}));
            $(".ProgressBar li:eq(0)").addClass("activeTwo").siblings().attr("class","");
        }

        pageBlock.on("click","#flushCode",function(){
            self.flushCaptcha();
        });

        flushCaptcha = self.flushCaptcha = function(){
            $(".captchaImg",pageBlock).attr("src","/ValidateCode?t=" + Math.random());
            $("input.aptcha",pageBlock).val("");
        }
    }

    var handleValidate = function(){

        jQuery.validator.addMethod("checkKey", function (value, element) {
            var result = true;
            //var pattern = new RegExp("[`~!#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&mdash;—|{}【】‘；：”“'。，、？]")
            var pattern=/[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
            for (var i = 0; i < value.length; i++) {
                var val = value[i];
                if(pattern.test(val)){
                    result = false;
                    break;
                }
            }
            return  this.optional(element) || result;
        }, "用户名包含非法字符，请检查输入。");


        var formValidate = $("#findPwdForm").validate({
            errorElement: 'small',
            errorClass: 'errorText',
            focusInvalid: false,
            ignore: "",
//            debug: true,
            rules: {
                loginKey: {required: true,checkKey:true,remote:"/" + rappId + "/handler/check_user.jsx?t="+ Math.random() + "&token=" + $("input[name='token']","#findPwdForm").val()},
                captcha:{required:true,remote:"/" + rappId + "/handler/judgeCaptcha.jsx?t="+ Math.random()}
            },
            messages: {
                loginKey:{required:"请输入您的手机号/邮箱/用户名",rangelength:"请确认您输入的用户名，用户名为4-20位字符",remote:"此用户名不存在，请检查您的输入。",checkKey:"用户名包含非法字符，请检查输入。"},
                captcha:{required:"请填写验证码",remote:"验证码不正确"}
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
                    url:"/" + rappId + "/handler/find_password_handler.jsx",
                    dataType:"json",
                    //beforeSubmit: showRequest,
                    success: function(response) {
                        if (response.state) {
//                            pageBlock.html(template("step2_email_template", response));
//                            $(".ProgressBar li:eq(1)").addClass("activeTwo").prev().attr("class", "activeOne");
                            document.location.search = "k=" + response.skey;
                        } else {
                            if (response.errorCode == "empty_loginKey") {
                                var helpBlock = $(".errorText[for='loginKey']", form);
                                helpBlock.html("请输入您的用户名");
                                helpBlock.parent().addClass("has-error");
                            } else if (response.errorCode == "member_not_exist") {
                                var helpBlock = $(".errorText[for='loginKey']", form);
                                helpBlock.html("此用户名不存在，请检查您的输入。");
                                helpBlock.parent().addClass("has-error");
                                $("input.username", form).focus();
                            } else if (response.errorCode == "member_email_not_exist") {
                                var helpBlock = $(".errorText[for='loginKey']", form);
                                helpBlock.html("此用户名没有设置邮箱，无法通过邮箱找回密码。");
                                helpBlock.parent().addClass("has-error");
                                $("input.username", form).focus();
                            } else if (response.errorCode == "system_error") {
                                alert("系统繁忙，请稍后再试。");
                            } else if (response.errorCode == "empty_captcha") {
                                var helpBlock = $(".errorText[for='captcha']", form);
                                helpBlock.html("请填写验证码");
                                helpBlock.parent().addClass("has-error");
                                form.captcha.focus();
                            } else if (response.errorCode == "captcha_error") {
                                var helpBlock = $(".errorText[for='captcha']", form);
                                helpBlock.html("验证码不正确");
                                helpBlock.parent().addClass("has-error");
                                form.captcha.focus();
                            }
                            flushCaptcha();
                        }
                    }
                });
            }
        });
    }

    var handleSendEmail = function () {
        pageBlock.on("click","#btnSendEmail",function(){
            var self = $(this),parent = self.parent("p");
            parent.removeClass("has-error");
            parent.find(".errorText").html("");
            $.get("/" + rappId + "/handler/find_password_send_email_handler.jsx",{skey:self.attr("skey"),pageId:self.attr("pageId"),mid:self.attr("mid"),t:Math.random()},function(resp){
                if(resp.state){
                    pageBlock.html(template("step2_msg_template",resp));
                }else{
                    var msg = "";
                    if(resp.errorCode == "skey_empty" || resp.errorCode == "pageId_empty" || resp.errorCode == "mid_empty" || resp.errorCode == "login_key_empty"){
                        msg = "参数错误";
                    }else if(resp.errorCode == "member_not_exist"){
                        msg = "该用户不存在或已被删除";
                    }else if(resp.errorCode == "member_email_not_exist"){
                        msg = "该用户的邮箱地址不存在或已被更改";
                    }else if(resp.errorCode == "wait"){
                        msg = "发送太频繁，请稍等一会。";
                    }else if(resp.errorCode == "system_error"){
                        msg = "系统繁忙，请稍后再试。";
                    }else if(resp.errorCode == "has_max_times"){
                        msg = "抱歉，每天最多允许找回" + resp.maxTimes + "次密码。";
                    }

                    var helpBlock = parent.find(".errorText");
                    if(!helpBlock || helpBlock.length == 0){
                        helpBlock = $('<small class="errorText"></small>');
                        helpBlock.appendTo(parent);
                    }
                    helpBlock.html(msg);
                    parent.addClass("has-error");
                }
            },"json");
        });
    }

    var handleMobile = function(){
        pageBlock.on("click","#getValidateCode",function(){
            var self = $(this),parent = self.parent("p");
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
            $.get("/" + rappId + "/handler/find_password_send_msg_handler.jsx",{skey:self.attr("skey"),pageId:window.pageId,mid:window.mid,t:Math.random()},function(resp){
                if(resp.state){
                    helpBlock.html("校验码已发出，请注意查收短信。");
                    self.attr("disabled","disabled");
                    var timeOut = window.result.msgInterval;//秒
                    self.html((--timeOut)+"秒");
                    var timer = setInterval(function(){
                        timeOut--;
                        self.html(timeOut+"秒");
                        if(timeOut <=0){
                            clearInterval(timer);
                            self.html("获取短信验证码");
                            self.removeAttr("disabled");
                        }
                    },1000);

                }else{
                    var msg = "";
                    if(resp.errorCode == "skey_empty" || resp.errorCode == "login_key_empty"){
                        msg = "参数错误";
                    }else if(resp.errorCode == "member_not_exist"){
                        msg = "该用户不存在或已被删除";
                    }else if(resp.errorCode == "member_mobile_not_exist"){
                        msg = "该用户的手机不存在或已被更改";
                    }else if(resp.errorCode == "please_wait"){
                        msg = "发送太频繁，请稍等一会。";
                    }else if(resp.errorCode == "system_error"){
                        msg = "系统繁忙，请稍后再试。";
                    }


                    helpBlock.html(msg);
                    parent.addClass("has-error");
                }
            },"json");
        }).on("click","#checkValidateCode",function(){
            var self = $(this),parent = $("#validateCodeBlock");
            var helpBlock = parent.find(".errorText");
            if(!helpBlock || helpBlock.length == 0){
                helpBlock = $('<small class="errorText"></small>');
                helpBlock.appendTo(parent);
            }
            parent.removeClass("has-error");
            helpBlock.html("");
            var codeObj = $("#validateCode");
            if(codeObj.val() == ""){
                helpBlock.html("请填写短信验证码");
                parent.addClass("has-error");
                return;
            }
            $.post("/" + rappId + "/handler/check_validate_code_handler.jsx",{skey:self.attr("skey"),code:codeObj.val(),pageId:window.pageId,mid:window.mid,t:Math.random()},function(resp){
                if(resp.state){
                    var linkTo = resp.webUrl + "/reset_password.html?lid=" + resp.loginId + "&code=" + resp.encode + "&t=2";
                    document.location.href = linkTo;
                }else{
                    var msg = "";
                    if(resp.errorCode == "skey_empty" || resp.errorCode == "code_empty" || resp.errorCode == "login_key_empty"){
                        msg = "参数错误";
                    }else if(resp.errorCode == "member_not_exist"){
                        msg = "该用户不存在或已被删除";
                    }else if(resp.errorCode == "member_mobile_not_exist"){
                        msg = "该用户的手机不存在或已被更改";
                    }else if(resp.errorCode == "validateCode_not_exist"){
                        msg = "验证码异常，请重新获取短信验证码。";
                    }else if(resp.errorCode == "validateCode_error"){
                        msg = "验证码不正确，请检查你输入的验证码。";
                    }else if(resp.errorCode == "system_error"){
                        msg = "系统繁忙，请稍后再试。";
                    }


                    helpBlock.html(msg);
                    parent.addClass("has-error");
                }
            },"json");


        });
    }
    return {
        init:function(){
            handleForm();
            handleValidate();
            handleSendEmail();
            handleMobile();
        }
    };
}();

$(function(){
    FindPwd.init();
});