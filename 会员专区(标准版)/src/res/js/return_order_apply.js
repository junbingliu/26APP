redirectURL = "${param.redirectURL}";
var frontPath = "";
$(function () {
    $("#checkboxall").click(function () { //全选
        $(':checkbox').prop("checked", this.checked);
        var checkedValue=this.checked;
        $(".isCheckValue").val(checkedValue);
    });
    $('[name=ck]:checkbox').click(function () {
        var $tmp = $('[name=ck]:checkbox');
        $('#checkboxall').prop('checked', $tmp.length == $tmp.filter(':checked').length);
    });
    if(isApplyForReplacementValue =="false"){
        $("#returnMode").show();
        $("#refundMode").show();
    }else{
        var barterProductRadio = $("input[name='opertType']").get(1).checked;
        var barterNewAddressRadio = $("input[name='barterAddress']").get(1).checked;
        if (barterProductRadio == true) {
            $("#barterAddress").show();
            $("#returnMode").hide();
            $("#refundMode").hide();
            if (barterNewAddressRadio == true) {
                $("#newbarterDeliveryAddress").show();
            } else {
                $("#newbarterDeliveryAddress").hide();
            }
        } else {
            $("#returnMode").show();
            $("#refundMode").show();
            $("#barterAddress").hide();
            $("#newbarterDeliveryAddress").hide();
        }
    }
    $('#remark').bind({
        //focus: function() {
        //    if(this.value=='请填写详细的商品问题信息，以便我们的售后人员及时判断并处理您的商品!') {this.value='';}
        //},
        //blur: function() {
        //    if(this.value=='') {this.value='请填写详细的商品问题信息，以便我们的售后人员及时判断并处理您的商品!';}
        //}
        keyup:function(event){
            var selfObj = $(this);
            var numberObj = selfObj.next(".textNumber");
            var number = selfObj.val().length;
            //if(number >= 100){
            //    event.stopPropagation();
            //    return false;
            //}
            numberObj.html(number + "/100")
        }
    });

});
function delectProductItem(id) {
   $("#itemProduct_"+id).remove();
}
function showNewAddress(type) {
    if (type == "old") {
        $("#newbarterDeliveryAddress").hide();
        $("#barterAddressType").val("old")
    } else {
        $("#newbarterDeliveryAddress").show();
        $("#barterAddressType").val("new")
    }
}
function showOpertType(iscan, type) {
    if (iscan == "false") {
        if (type == "returnProduct") {
            alert('该订单已经超过退货期限');
//            $("input:radio[name='opertType']").attr("checked", false);
        }
        if (type == "barterProduct") {
            alert('该订单已经超过换货期限');
//            $("input:radio[name='opertType']").attr("checked", false);
        }
    } else {
        if (type == "returnProduct") {
            $("#barterAddress").hide();
            $("#returnMode").show();
            $("#refundMode").show();
            $("#newbarterDeliveryAddress").hide();
        }
        if (type == "barterProduct") {
            $("#barterAddress").show();
            $("#returnMode").hide();
            $("#refundMode").hide();
        }
    }
}

jQuery(document).ready(function () {
    var options = {beforeSubmit:checkform, success:addFormResult};
    jQuery("#returnOrderForm").ajaxForm(options);
    $("#loadBarterAddress").load("/" + rappId + "/handler/order_return_barter_address_handler.jsx",{orderType:orderType,merchantId:merchantId}, function () {});
});
function addFormResult(data) {
    data = $.trim(data);
    if (data) {
        if (data == "ok") {
            alert("提交成功");
//            document.getElementById("submitFormBtn").disabled = true;
            window.location.href = frontPath + "/ucenter/return_order.html";
        }else{
            var $submit_button = $("#submit_button");
            $submit_button.val("提交");
            $submit_button.attr("disabled", false);
            alert(data);
        }
    }
}
function checkform() {
    var itemLength = $("#itemCount").val();
    var names = document.getElementsByName("ck");
    var len = names.length;
    var flg = false;
    if (len > 0) {
        for (var i = 0; i < len; i++) {
            if (names[i].checked) {
                flg = true;
            }
        }
    }
    if (flg == false) {
        alert("请至少选择一个商品进行退换货！")
        return false;
    }

    var isCheckValue = $(":radio[name='opertType']:checked").val();
    if (isCheckValue == "return") {
        alert('该订单已经超过退货期限');
        return false;
    }
    if (isCheckValue == "barter") {
        alert('该订单已经超过换货期限');
        return false;
    }

    var item = $(":radio[name='opertType']:checked");
    var len = item.length;
    if (len == 0) {
        alert("请您选择期望的处理方式");
        return false;
    }
    if (document.returnOrderForm.selectReason.value == "请选择") {
        alert("请您选择售后原因！");
        return false;
    }
    var remarkObj = $("#remark","#returnOrderForm");
    if (remarkObj.val() == "") {
        alert("请您填写问题描述！");
        document.returnOrderForm.remark.focus();
        return false;
    }else if(remarkObj.val().length >= 100){
        var newStr = remarkObj.val().substring(0,100);
        remarkObj.val(newStr);
        remarkObj.next(".textNumber").html(newStr.length + "/100");
    }
    if(item.val() == "returnProduct" || item.val() == "return"){
        var skuWay = $(":radio[name='skuWay']:checked");
        if (skuWay.length == 0) {
            alert("请您选择期望的退货方式");
            return false;
        }
        var refundInfo = $(":radio[name='refundInfo']:checked");
        if (refundInfo.length == 0) {
            alert("请您选择期望的退款方式");
            return false;
        }
    }
    if (document.returnOrderForm.contactPerson.value == "") {
        alert("请您填写联系人姓名！");
        document.returnOrderForm.contactPerson.focus();
        return false;
    }
    if (document.returnOrderForm.mobilePhone.value == "") {
        alert("请您填写联系人手机");
        document.returnOrderForm.mobilePhone.focus();
        return false;
    }else{
        var reg = /^(1[0-9][0-9]|15[0-9]|18[0-9]|147)\d{8}$/;
        if(!reg.test(document.returnOrderForm.mobilePhone.value)){
            alert("请填写正确的手机号码");
            document.returnOrderForm.mobilePhone.focus();
            return false;
        }
    }
    if(isApplyForReplacementValue !="false"){
        var barterProductRadio = $("input[name='opertType']").get(1).checked;
        var barterNewAddressRadio = $("input[name='barterAddress']").get(1).checked;
        if (len > 0) {
            if (barterProductRadio == true) {
                var item = $(":radio[name='barterAddress']:checked");
                var len = item.length;
                if (len == 0) {
                    alert("请您选择换货配送地址");
                    return false;
                } else {
                    if (barterNewAddressRadio == true) {
                        var userAddress = $("#userAddress");
                        if (userAddress.val() == "") {
                            alert("请选择配送地址");
                            return false;
                        }
                    }
                }
            }
        }
    }

    var $submit_button = $("#submit_button");
    $submit_button.val("正在提交...");
    $submit_button.attr("disabled",true);
}

function isCheck(num, count) {
    var element = document.getElementById("check_" + num);
    if (element.checked == true) {
        $("#isCheck_" + num).attr("value", "true");
    }
    else {
        $("#isCheck_" + num).attr("value", "false");
    }
}
function checkAmount(num) {
    var checkText=$("#select_"+num).val();
    $("#count_" + num).attr("value", checkText);
    $("#amout_" + num).attr("value", checkText);
}

/*用户自己输入地址*/
function userCustomAddress() {
    $("#loadAddress").load("barterNewAddress.jsp", function () {
        $(function () {
            $("#button1").click(function () {
                var reg;
                var buyName = document.getElementById("userName").value;
                var mobile = document.getElementById("mobile").value;
                var phone = document.getElementById("phone").value;
                var streetAddress = document.getElementById("address").value;
                var Zip = document.getElementById("Zip").value;
                var region = jQuery("#regionCanvas").find("select").last().val();
                var addressId = document.getElementById("addressId").value;
                $("#submitInput").attr("disabled", "");
                if (buyName == "") {
                    window.alert("联系人不能为空！");
                    document.getElementById("userName").focus();
                    return false;
                }
                if (mobile == "" && phone == "") {
                    window.alert("电话和手机必须填写其中一个！");
                    document.getElementById("phone").focus();
                    return false;
                }
                if (mobile != "") {
                    reg = /^(13[0-9]|15[0-9]|18[0-9]|147)\d{8}$/;
                    if (!reg.test(mobile)) {
                        window.alert("请填写正确的手机号码");
                        document.getElementById("mobile").focus();
                        return false;
                    }
                }
                if (phone != "") {
                    reg = /\d{3}-\d{8}|\d{4}-\d{7}/;
                    if (!reg.test(phone)) {
                        window.alert("请填写正确的电话号码");
                        document.getElementById("phone").focus();
                        return false;
                    }
                }

                if (region == "请选择...") {
                    window.alert("请选择所在地区");
                    return false;
                }
                if (streetAddress == "") {
                    window.alert("详细地址不能为空！");
                    document.getElementById("address").focus();
                    return false;
                }
                if (Zip != "") {
                    reg = /^[0-9]{6}$/;
                    if (!reg.test(Zip)) {
                        window.alert("请填写正确的邮政编码");
                        document.getElementById("Zip").focus();
                        return false;
                    }
                }
                if (mobile != "") {
                    reg = /^(13[0-9]|15[0-9]|18[0-9]|147)\d{8}$/;
                    if (!reg.test(mobile)) {
                        window.alert("请填写正确的手机号码");
                        document.getElementById("mobile").focus();
                        return false;
                    }
                }
                if (phone != "") {
                    reg = /\d{3}-\d{8}|\d{4}-\d{7}/;
                    if (!reg.test(phone)) {
                        window.alert("请填写正确的电话号码");
                        document.getElementById("phone").focus();
                        return false;
                    }
                }
                $.post("/"+rappId+"/handler/barter_new_address_handler.jsx", {userName:buyName, phone:phone, address:streetAddress, Zip:Zip, mobile:mobile, RegionId:region, addressId:addressId}, function (data) {
                    window.location.href = window.location.href;
                })
            })
            $("#button2").click(function () {
                $("#myAddressBookForm").remove();
                $("#submitInput").attr("disabled", "");
                $("#getProductAddress").show(200);
                $("#tr1").show();
                $("#tr2").show();
                $("#tr3").show();
            })
        })
    });
    $("#submitInput").attr("disabled", "disabled");
    $("#getProductAddress").hide(200);
    $("#tr1").hide();
    $("#tr2").hide();
    $("#tr3").hide();
}
//配送方式，自提点
function changeMessage() {
    var obj = document.getElementById("userAddress");
    var index = obj.selectedIndex;
    var title = obj.options[index].getAttribute("name");
    var val = title.split(",");
    $("#changeContactPerson").attr("value", val[0]);
    $("#changeMobile").attr("value", val[1]);
    $("#changePhone").attr("value", val[2])
    $("#changePostal").attr("value", val[3]);

    var flag = false;
    $.post("/" + rappId + "/handler/order_return_get_delivery_way_handler.jsx", {regionId:val[4], merchantId:val[6], orderType:val[5]},
        function (data) {
            var dataObj = eval("(" + data + ")");
            var deliveryWay = document.getElementById("changeType");
            deliveryWay.length = 0;
            if (dataObj.records.length == 0) {
                $("#isDeveryWay").hide();
            } else {
                $("#isDeveryWay").show();
                for (var i = 0; i < dataObj.records.length; i++) {
                    deliveryWay.options.add(new Option(dataObj.records[i].name, dataObj.records[i].value));
                }
                flag = true;
            }

        });
    if (flag == true) {
        var obj = document.getElementById("changeType");
        var index = obj.selectedIndex;
        var deliveryWay = obj.options[index].getAttribute("value");
        $.post("/"+rappId+"/handler/get_delivery_points_handler.jsx", {regionId:val[4], merchantId:val[6], deliveryWayId:deliveryWay},
            function (data) {
                var deliveryPointObj = eval("(" + data + ")")
                var deliveryPoint = document.getElementById("deliveryPoint");
                deliveryPoint.length = 0;
                if (deliveryPointObj.records.length == 0) {
                    $("#isDelvery").hide();
                } else {
                    $("#isDelvery").show();
                    for (var i = 0; i < deliveryPointObj.records.length; i++) {
                        deliveryPoint.options.add(new Option(deliveryPointObj.records[i].name, deliveryPointObj.records[i].value));
                    }
                }
            });
    }
}
function changePointByWay() {
    var obj = document.getElementById("changeType");
    var index = obj.selectedIndex;
    var deliveryWay = obj.options[index].getAttribute("value");
    var obj = document.getElementById("userAddress");
    var index = obj.selectedIndex;
    var title = obj.options[index].getAttribute("name");
    var val = title.split(",");
    $.post("/"+rappId+"/handler/get_points_by_way_handler.jsx", {regionId:val[4], merchantId:val[6], deliveryWayId:deliveryWay},
        function (data) {
            var deliveryPointObj = eval("(" + data + ")")
            var deliveryPoint = document.getElementById("deliveryPoint");
            deliveryPoint.length = 0;
            if (deliveryPointObj.records.length == 0) {
                $("#isDelvery").hide();
            } else {
                $("#isDelvery").show();
                for (var i = 0; i < deliveryPointObj.records.length; i++) {
                    deliveryPoint.options.add(new Option(deliveryPointObj.records[i].name, deliveryPointObj.records[i].value));
                }
            }
        });

}
/* 弹出层*/
function letDivCenter(divName) {
    var top = ($(window).height() - $(divName).height()) / 4;
    var left = ($(window).width() - $(divName).width()) / 2;
    var scrollTop = $(document).scrollTop();
    var scrollLeft = $(document).scrollLeft();
    $(divName).css({ position:'absolute', 'top':top + scrollTop, left:left + scrollLeft }).show();
}
function showMask() {
    $("#mask").css("height", $(document).height());
    $("#mask").css("width", $(document).width());
    $("#mask").show();
}
function showAll(divName) {
    showMask();
    letDivCenter(divName);
}
function hideAll(divName) {
    $("#mask").hide();
    $(divName).hide();
}
/* end 弹出层*/
function deliveryCustomAddress() {
    showAll("#loadDeliveryAddress");
    $("#loadDeliveryAddress").html(template("newAddressTemplate",{}));
    (function () {
        var AcontactPerson = $(".address #userName");
        var Amobile = $(".address #mobile");
        var Aphone = $(".address #phone");
        var Aaddress = $(".address #address");
        var AZip = $(".address #Zip");
        var AregionCanvas = $(".address #regionCanvas");
        var AaddressId = $(".address #addressId");
        $("#button1").click(function () {
            var reg;
            var buyName = AcontactPerson.val();
            var mobile = Amobile.val();
            var phone = Aphone.val();
            var streetAddress = Aaddress.val();
            var Zip = AZip.val() || "";
            var region = AregionCanvas.find("select").last().val();
            var addressId = AaddressId.val();
            $("#submitInput").attr("disabled", false);
            if (buyName == "") {
                window.alert("联系人不能为空！");
                document.getElementById("userName").focus();
                return false;
            }
            if (mobile == "" && phone == "") {
                window.alert("电话和手机必须填写其中一个！");
                document.getElementById("phone").focus();
                return false;
            }
            if (mobile != "") {
                reg = /^(13[0-9]|15[0-9]|18[0-9]|147)\d{8}$/;
                if (!reg.test(mobile)) {
                    window.alert("请填写正确的手机号码");
                    document.getElementById("mobile").focus();
                    return false;
                }
            }
            if (phone != "") {
                reg = /\d{3}-\d{8}|\d{4}-\d{7}/;
                if (!reg.test(phone)) {
                    window.alert("请填写正确的电话号码");
                    document.getElementById("phone").focus();
                    return false;
                }
            }

            if (region == "请选择...") {
                window.alert("请选择所在地区");
                return false;
            }
            if (streetAddress == "") {
                window.alert("详细地址不能为空！");
                document.getElementById("address").focus();
                return false;
            }
            if (Zip != "") {
                reg = /^[0-9]{6}$/;
                if (!reg.test(Zip)) {
                    window.alert("请填写正确的邮政编码");
                    document.getElementById("Zip").focus();
                    return false;
                }
            }
            if (mobile != "") {
                reg = /^(13[0-9]|15[0-9]|18[0-9]|147)\d{8}$/;
                if (!reg.test(mobile)) {
                    window.alert("请填写正确的手机号码");
                    document.getElementById("mobile").focus();
                    return false;
                }
            }
            if (phone != "") {
                reg = /\d{3}-\d{8}|\d{4}-\d{7}/;
                if (!reg.test(phone)) {
                    window.alert("请填写正确的电话号码");
                    document.getElementById("phone").focus();
                    return false;
                }
            }
            $.post("/"+rappId+"/handler/barter_new_address_handler.jsx", {userName:buyName, phone:phone, address:streetAddress, Zip:Zip, mobile:mobile, RegionId:region, addressId:addressId},
                function (data) {
                    hideAll('#loadDeliveryAddress');
                    $("#loadBarterAddress").load("/"+rappId+"/handler/order_return_barter_address_handler.jsx?addressId=" + data,{orderType:orderType,merchantId:merchantId}, function () {
                        changeMessage();
                    });
                })
        })
        $("#button2").click(function () {
            AcontactPerson.val("");
            Amobile.val("");
            Aphone.val("");
            Aaddress.val("");
            AZip.val("");
            AregionCanvas.find("select").first().val("").siblings().hide();
            AaddressId.val("");
        })
        jQuery(SelectTree.init);
    })();
    $("#submitInput").attr("disabled", true);

}
function closeWindow() {
    parent.window.opener = null;
    parent.window.open("", "_self");
    parent.window.close();
}