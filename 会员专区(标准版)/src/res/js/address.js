$(function(){
    var enableSave = true;
    var addrForm = $("#addrForm");

    jQuery.validator.addMethod("mobile", function (value, element) {
        var length = value.length;
        var mobile = /^(((17[0-9]{1})|(13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        return  this.optional(element) || (length == 11 && mobile.test(value));
    }, "请正确填写您的手机号码");

    var formValidate = addrForm.validate({
        errorElement: 'small',
        errorClass: 'errorText',
        focusInvalid: false,
        ignore: "",
                //debug: true,
        rules: {
            userName: {required: true,maxlength:20},
            mobile: {required: true,mobile:true,digits:true,rangelength:[11,11]},
            address: {required: true,maxlength: 100},
            areaCode: {required: function(){
                if($("[name='phone']",addrForm).val() != ""){
                    return true;
                }
                return false;
            },maxlength:4},
            phone: {required: function(){
                if($("[name='areaCode']",addrForm).val() != ""){
                    return true;
                }
                return false;
            },maxlength:8},
            region_0:{required: true},
            region_1:{required: true},
            region_2:{required: true},
            region_3:{required: true}
        },
        messages: {
            userName:{required:"请填写收货人",maxlength:""},
            mobile:{required:"请填写您的手机号码",digits:"手机号码应为数字",rangelength:"手机号码为11位数字",mobile:"请正确填写您的手机号码"},
            address:{required:"请输入您的邮箱",maxlength:""},
            areaCode:{required:"请填写固定电话区号",rangelength:""},
            phone:{required:"请填写固定电话号码",maxlength:""},
            region_0:{required:"请正确选择所在地区"},
            region_1:{required:"请正确选择所在地区"},
            region_2:{required:"请正确选择所在地区"},
            region_3:{required:"请正确选择所在地区"}
        },
        invalidHandler: function (event, validator) { //display error alert on form submit

        },
        highlight: function (element) { // hightlight error inputs
            //$(element).parent().addClass('has-error'); // set error class to the control group
            element = $(element);
            if(element.is("select.selectTree")){
                element.parent().parent().addClass('has-error');
            }else{
                element.parent().addClass('has-error');
            }
        },
        unhighlight: function (element) { // revert the change done by hightlight
            element = $(element);
            if(element.is("select.selectTree")){
                var doUnHighlight = true;
                var siblings = element.siblings("select.selectTree");
                for(var i=0;i<siblings.length;i++){
                    if(siblings.eq(i).val() == ""){
                        doUnHighlight = false;
                        break;
                    }
                }
                if(doUnHighlight){
                    element.parent().parent().removeClass('has-error');
                }

            }else{
                element.parent().removeClass('has-error');
            }
        },
        errorPlacement: function(error, element) {
            if(element.is("select.selectTree")){
                if(error.text() != ""){
                    error.appendTo(element.parent().parent());
                }
            }else{
                error.appendTo(element.parent());
            }
        },
        success: function (label) {
            label.parent().removeClass('has-error'); // set success class to the control group
        },
        submitHandler: function (form) {
            $(form).ajaxSubmit({
                type:"post",
                url:form.action,
                dataType:"json",
                //beforeSubmit: function(){
                //    enableSave = false;
                //},
                success: function(response){
                    if(response.state){
                        document.location.reload();
                    }else{
                        if(response.errorCode == "not_logged" || response.errorCode == "unlawful_user"){
                            document.location.href = "/login.html?rul=/ucenter/address.html"
                        }else if(response.errorCode == "token_empty" || response.errorCode == "token_null"){
                            alert("提交参数异常。");
                        }else if(response.errorCode == "token_error"){
                            alert("请求异常，请重新再试。");
                        }else{
                            alert(response.errorCode);
                        }
                    }
                    enableSave = true;
                }
            });
        }
    });

    $("checkbox",addrForm).on("click",function(){
        var curObj = $(this);
        var checked = curObj.attr("data-checked") == "true" ? "false" : "true";
        curObj.attr("data-checked",checked);
        if(checked == "true"){
            $("input:hidden",curObj).val("true");
            curObj.addClass("active");
        }else{
            $("input:hidden",curObj).val("false");
            curObj.removeClass("active");
        }
    });

    $("#saveBtn").on("click",function(){
        if(enableSave){
            addrForm.submit();
        }
        enableSave = false;
    });

    $("#cancelBtn").on("click",function(){
        addrForm.resetForm();
    });

    $(".AddressList").on("click",".setDefaultBtn",function(){
        var self = $(this),rowObj = self.closest(".addressRow"),objId = rowObj.attr("objId");
        $.get("/" + rappId + "/handler/address_set_default_handler.jsx",{addressId:objId,token:$("input[name='token']",addrForm).val()},function(resp){
            if(resp.state){
                //rowObj.addClass("active");
                //rowObj.prepend('<span class="activehd">默认收货地址</span>');
                //rowObj.siblings(".active").removeClass("active").children().eq(0).remove();
                document.location.reload();
            }else{

            }
        },"json");
    }).on("click",".editBtn",function(){
        var self = $(this),rowObj = self.closest(".addressRow"),objId = rowObj.attr("objId");
        $.get("/" + rappId + "/handler/address_get_handler.jsx",{addressId:objId,token:$("input[name='token']",addrForm).val()},function(resp){
            if(resp.state){
                var address = resp.address;
                for(var key in address){
                    if(key == "regionId"){
                        $("#RegionId",addrForm).val(address[key]);
                        $(SelectTree.init);
                    }if(key == "isDefault"){
                        var field = $("[name='"+key+"']",addrForm),parent = field.parent();
                        field.val(address[key]);
                        if(address[key] == "true" || address[key] == true){
                            parent.addClass("active")
                        }
                        parent.attr("data-checked",address[key] + "");
                    }if(key == "phone"){
                        var splitPhone = address[key].split("-");
                        $("[name='areaCode']",addrForm).val(splitPhone[0]);
                        $("[name='phone']",addrForm).val(splitPhone[1]);
                    }else{
                        $("[name='"+key+"']",addrForm).val(address[key]);
                    }
                }
            }else{

            }
        },"json");
    }).on("click",".deleteBtn",function(){
        var confirm = window.confirm("确定删除吗？");
        if(!confirm){
            return false;
        }
        var self = $(this),rowObj = self.closest(".addressRow"),objId = rowObj.attr("objId");
        $.post("/" + rappId + "/handler/address_delete_handler.jsx",{addressId:objId,token:$("input[name='token']",addrForm).val()},function(resp){
            if(resp.state){
                document.location.reload();
            }else{

            }
        },"json");
    });

    function components_Checkbox(){
        $('.checkbox').click(function (){
            if ($(this).attr('data-checked') != 'true') {
                $(this).attr('data-checked', true).addClass('active');
                $("input:hidden",this).val("true");
            } else {
                $(this).attr('data-checked', false).removeClass('active');
                $("input:hidden",this).val("false");
            }
        });
    }
    components_Checkbox();

});
