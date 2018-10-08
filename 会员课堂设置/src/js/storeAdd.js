$(document).ready(function () {


    $.get("getStoreMerchantByRegionId.jsx",function (ret) {
                $("#merchantCode").html("<option>请选择商家</option>")
                var merchantCodes = ret.merchants;
                for (var i = 0; i < merchantCodes.length; i++) {
                    $("#merchantCode").append('<option>'+merchantCodes[i].code+'</option>');
                }

            },"json");

            $.post("../util/getRegionChildren.jsx",{parentId:"c_region_1602"},function (ret) {
                var html = "<option>请选择省份</option>";

                var info = ret.children;
                for (var i = 0; i < info.length; i++) {
                    html += "<option value='"+info[i].id+","+info[i].name+"'>"+info[i].name+"</option>";
                }
                $("#province").html(html);

           },"json");

            //加载市信息
            $("#province").on("change",function () {
                var parentId = $(this).val().split(",")[0];
                if (parentId == "请选择省份") {
                    $("#city").html('<option>请选择市</option>');
                    return;
                }
                $.post("../util/getRegionChildren.jsx",{parentId:parentId},function (ret) {
                    var html = "<option>请选择市</option>";
                    var info = ret.children;
                    for (var i = 0; i < info.length; i++) {
                        html += "<option value='"+info[i].name+"'>"+info[i].name+"</option>";
                    }
                    $("#city").html(html);

                },"json");
            });

            //保存添加
            $("#saveAddBtn").click(function () {
                if (!retTest("add")) return;

                var formData = $("#addForm").serialize()+"&handle=add";
                $.post("save.jsx",formData,function (ret) {
                    if (ret.status != 200) {
                        alert("发生了错误,错误信息: "+ret.msg);
                        return;
                    }
                    location.href = "storeList.jsx?m=" + merchantId;
                },"json");
            });

            $("#close").click(function () {
                location.href = "storeList.jsx?m=" + merchantId;
            });

    //表单校验
    function retTest(handle) {
        if (handle == "add") {
            var merchantCode = $("#merchantCode").val();
            if (!merchantCode) {
                alert("存在内容为空的输入项");
                return false;
            }
        }
        var name = $("#name").val();
        var address = $("#address").val();
        var phone = $("#phone").val();
        var position = $("#position").val();
        if (!name || !address || !phone || !position) {
            alert("存在内容为空的输入项");
            return false;
        }
        var reg = /^((13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])+\d{8})$/;
        if (!reg.test(phone)) {
            alert("手机号码格式有误!");
            return false;
        }
        return true;
    }

});