/* Created by Qianglong Mo 2015 */

$(function (){
    var vipCardList = $("#vipCardList");

    vipCardList.on("click",".unbindBtn",function(){
        if(!window.confirm("确定解绑会员卡？")){
            return false;
        }

        var parent = $(this).closest("tr.tableBd");
        var tds = parent.find("td");
        var params = {
            cardno:tds.eq(0).html(),
            shopid:parent.attr("shopId"),
            idcard:tds.eq(2).html(),
            guestname:tds.eq(1).html(),
            mobile:tds.eq(3).html(),
            token:token
        }
        $.post("/" + rappId + "/handler/vip_card_unbind_handler.jsx",params,function(resp){
            if(resp.state == "10"){
                document.location.href = "/login.html?rurl=" + window.location.pathname;
                return;
            }else if(resp.state == "0"){
                alert(resp.msg);
                document.location.reload();
            }else{
                alert(resp.msg);
            }
        },"json");
    }).on("click",".updateBtn",function(){
        var parent = $(this).closest("tr.tableBd");
        var tds = parent.find("td");
        var params = {
            cardNo:tds.eq(0).html(),
            shopId:parent.attr("shopId"),
            idCard:tds.eq(2).html(),
            guestName:tds.eq(1).html(),
            mobile:tds.eq(3).html()
        }

        var layer = $("#modifyCardInfoLayer");
        layer.html(template("modifyCardInfoTemplate",params)).css({
            "left": (($(document.body).width() - layer.width()) / 2) + "px",
            "top": $(document).scrollTop() + 100 + "px"
        }).show();
        layer.on("click", ".closeBtn", function () {
            layer.hide();
        });

        var modifyCardForm = $("#modifyCardForm");

        var formValidate = modifyCardForm.validate({
            errorElement: 'small',
            errorClass: 'errorText',
            focusInvalid: false,
            ignore: "",
            debug: true,
            rules: {
                cardno: {required: true},
                guestname: {required: true},
                mobile: {required: true},
                idcard:{required:true},
                vcode:{required:true}
            },
            messages: {
                cardno:{required:"请输入您的会员卡号"},
                guestname:{required:"请填写姓名"},
                mobile:{required:"请填写手机号"},
                idcard:{required:"请填写身份证号"},
                vcode:{required:"请填写手机验证码"}
            },
            invalidHandler: function (event, validator) { //display error alert on form submit

            },
            highlight: function (element) { // hightlight error inputs
                $(element).closest('.formGroup').addClass('has-error'); // set error class to the control group
            },
            unhighlight: function (element) { // revert the change done by hightlight
                var formGroup = $(element).closest('.formGroup');
                formGroup.removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                error.appendTo(element.parent());
            },
            success: function (label) {
                label.closest('.formGroup').removeClass('has-error'); // set success class to the control group
            },
            submitHandler: function (form) {
                $(form).ajaxSubmit({
                    type:"post",
                    url:"/" + rappId + "/handler/vip_card_update_handler.jsx",
                    dataType:"json",
                    //beforeSubmit: showRequest,
                    success: function(response){
                        if(response.state == "10"){
                            document.location.href = "/login.html?rurl=" + window.location.pathname;
                            return;
                        }else if(response.state == "0"){
                            alert(response.msg);
                            document.location.reload();
                            return;
                        }else{
                            alert(response.msg);
                        }
                    }
                });
            }
        });

        $("#getValidationCode",modifyCardForm).on("click",function(){
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

            var mobile = $("input[name='mobile']",modifyCardForm);
            if(mobile.val() == ""){
                parent.addClass("has-error");
                helpBlock.html("请输入您要绑定的手机号码");
                return;
            }

            $.get("/" + rappId + "/handler/vip_card_validate_msg_handler.jsx",{mobile:mobile.val(),t:Math.random(),token:token},function(resp){
                if(resp.state){
                    helpBlock.html("验证码已发出，请注意查收。");
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



});