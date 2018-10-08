$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_records.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };

    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});



    //修改弹窗
    $("body").on("click","#showEditWindow",function(){

        var objId = $(this).data("id");
        $.get("editStore.jsx", {id : objId}, function (ret) {

            $("#name").val(ret.name);
            $("#address").val(ret.address);
            $("#phone").val(ret.phone);
            $("#position").val(ret.position);
            $("#storeId").val(ret.id);
        },"json");
        $("#editWindow").modal('show');
        $("#editCity").html('<option>请选择市</option>');
        $.post("../util/getRegionChildren.jsx",{parentId:"c_region_1602"},function (ret) {
            var html = "<option>请选择省份</option>";
            var info = ret.children;
            for (var i = 0; i < info.length; i++) {
                html += "<option value='"+info[i].id+","+info[i].name+"'>"+info[i].name+"</option>";
            }
            $("#editProvince").html(html);
        },"json");


    });

    //加载市信息
    $("#editProvince").on("change",function () {
        var parentId = $(this).val().split(",")[0];
        if (parentId == "请选择省份") {
            $("#editCity").html('<option>请选择市</option>');
            return;
        }
        $.post("../util/getRegionChildren.jsx",{parentId:parentId},function (ret) {
            var html = "<option>请选择市</option>";
            var info = ret.children;
            for (var i = 0; i < info.length; i++) {
                html += "<option value='"+info[i].name+"'>"+info[i].name+"</option>";
            }
            $("#editCity").html(html);

        },"json");
    });

    //保存修改操作
    $("body").on("click","#saveEditBtn",function(){

        if (!retTest("edit")) return;
        var id = $("#storeId").val();
        if (!id) return;
        var formData = $("#editForm").serialize() + "&handle=edit&id="+id;
        $.get("save.jsx",formData,function (ret) {
            if (ret.status != 200) {
                alert("发生了错误,错误信息: "+ret.msg);
                return;
            }
            $("#editWindow").modal('hide');
            pagination.load(null);
        },"json");
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
        var province = $("#province").val();
        var city = $("#city").val();
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

    $("body").on("click","#test",function(){

        $.get("test.jsx",function (ret) {
            alert(ret);
        });
    });


    //删除操作
    $("body").on("click","#delBtn",function(){
        if (confirm("确定要删除该门店吗?")) {
            var id = $(this).data("id");
            $.get("delete.jsx",{id:id},function (ret) {
                if (ret.status != 200) {
                    alert("发生了错误,错误信息: "+ret.msg);
                    return;
                }
                pagination.load(null);
            },"json")
        }
    });

    //停用
    $("body").on("click",".disableBtn",function(){
        if (confirm("确定要停用吗?")) {
            enableOrDisable("disable", $(this).data("id"), pagination);
        }
    });

    //启用
    $("body").on("click",".enableBtn",function(){
        if (confirm("确定要启用吗?")) {
            enableOrDisable("enable", $(this).data("id"),pagination);
        }
    });

});

//停用启用方法抽取
function enableOrDisable(handle, id, pagination) {
    var status = handle == "enable" ? 1 : 0;
    $.get("changeStatus.jsx",{status:status,id:id}, function (ret) {
        if (ret.status != 200) {
            alert("发生了错误,错误信息: "+ret.msg);
            return;
        }
        pagination.load(null);
    }, "json");
}

