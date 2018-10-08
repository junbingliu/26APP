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


    //添加弹窗
    $("#showAddWindow").click(function () {

        $.get("addClub.jsx", function (backData) {
            $("#editWindowDiv").html(backData);
        });
        $("#editWindow").modal('show');
    });

    var $body = $("body");

    //保存添加操作
    $body.on("click", "#saveAddBtn", function () {
        var name = $("#name").val();
        var storyContent = $("#storyContent").val();
        var entranceImg = $("#entranceImg").val();
        var storyBackgroudImg = $("#storyBackgroudImg").val();
        if (!name || !storyContent || !entranceImg || !storyBackgroudImg) {
            alert("必填项不能为空!");
            return;
        }

        var formData = $("#addForm").serialize() + "&handle=add";
        $.get("addClub_handler.jsx", formData, function (ret) {
            if (ret.code != "0") {
                alert(ret.msg);
                return;
            }
            $("#editWindow").modal('hide');
            pagination.load(null);
        }, "json");

    });

    //修改弹窗
    $body.on("click", ".showEditWindow", function () {

        var objId = $(this).data("id");
        $.get("editClub.jsx", {id: objId}, function (ret) {
            $("#editWindowDiv").html(ret);
        });
        $("#editWindow").modal('show');
    });

    //保存修改操作
    $body.on("click", "#saveEditBtn", function () {
        var name = $("#name").val();
        var storyContent = $("#storyContent").val();
        var entranceImg = $("#entranceImg").val();
        var storyBackgroudImg = $("#storyBackgroudImg").val();
        if (!name || !storyContent || !entranceImg || !storyBackgroudImg) {
            alert("必填项不能为空!");
            return;
        }

        var id = $(this).data("id");
        var formData = $("#editForm").serialize() + "&handle=edit&id=" + id;
        $.get("addClub_handler.jsx", formData, function (ret) {
            if (ret.code != "0") {
                alert(ret.msg);
                return;
            }
            $("#editWindow").modal('hide');
            pagination.load(null);
        }, "json");

    });

    $body.on("click", "#test", function () {

        $.get("test.jsx", function (ret) {
            alert(ret);
        });
    });


    $body.on("click", "#sort", function () {
        var id = $(this).data('id');
        var sortNum = $("#" + id).html();
        $("#" + id).html("<input type='text' style='width: 40px' id='editSort_" + id + "' value='" + $("#sort").val() + "'>");
        var editId = "#" + "editSort_" + id;
        $(editId).focus();
        $(editId).val(sortNum);
        $(editId).bind("blur", function () {
            var reg = /^[+]{0,1}(\d+)$/;
            if (!reg.test($(editId).val())) {
                $("#" + id).html(sortNum);
                return;
            }
            $.get("editSort.jsx", {id: id, sortNum: $(editId).val()}, function (ret) {
                if (ret.status != 200) {
                    alert(ret.msg);
                    $("#" + id).html(sortNum);
                    return;
                }
                $("#" + id).html($(editId).val());
            }, "json");
        })
    });


    //删除操作
    $body.on("click", "#delBtn", function () {
        if (confirm("确定要删除该俱乐部吗?")) {
            var id = $(this).data("id");
            $.get("delete.jsx", {id: id}, function (ret) {
                if (ret.status != 200) {
                    alert("发生了错误,错误信息: " + ret.msg);
                    return;
                }
                pagination.load(null);
            }, "json")
        }
    });


    //停用
    $body.on("click", "#disableBtn", function () {
        if (confirm("确定要停用吗?")) {
            enableOrDisable("disable", $(this).data("id"), pagination);
        }
    });

    //启用
    $body.on("click", "#enableBtn", function () {
        if (confirm("确定要启用吗?")) {
            enableOrDisable("enable", $(this).data("id"), pagination);
        }
    });


    //图片上传
    $body.on("change", "#entranceImg", function () {
        getImg("entrance", this);
    });
    $body.on("change", "#storyBackgroudImg", function () {
        getImg("storyBackgroud", this);
    });

    $body.on('click', "#savePosBtn", function () {
        var posList = [];
        var foo = $("input[name='clubPos']");
        $(foo).each(function () {
            var $this = $(this);

            var clubId = $this.attr("data-a");

            var pos = $this.val();
            var jPos = {};
            jPos.id = clubId;
            jPos.pos = pos;

            posList.push(jPos);

        });

        var pageData = {
            json: JSON.stringify(posList)
        };
        $.post("batchUpdatePos.jsx", pageData, function (data) {
            if (data.code != "0") {
                alert(data.msg);
                return;
            }
            pagination.load(null);

        }, "json");
    });

});

//图片上传方法抽取
function getImg(img, t) {

    if (!t.files || !t.files[0]) {
        return;
    }
    var reg = /\.jpg$|\.jpeg$|\.gif$|\.png$/i;

    if (!reg.test($("#" + img + "Img").val())) {
        alert("请上传jpg,gif,jpeg,png格式的文件!");
        $("#" + img + "Img").val('');
        return;
    }
    var awardImg = t.files[0];
    var reader = new FileReader();
    if (awardImg) {
        reader.readAsDataURL(awardImg);
    }
    reader.onload = function (event) {
        var imgData = event.target.result;
        $.post("../util/uploadFile.jsx", {type: "json", imgData: JSON.stringify(imgData)}, function (ret) {
            $("#" + img + "ImgUrl").val(ret.data.imgUrl);
        }, "json");
    }
}

function enableOrDisable(handle, id, pagination) {
    var status = handle == "enable" ? 1 : 0;
    $.get("changeStatus.jsx", {status: status, id: id}, function (ret) {
        if (ret.status != 200) {
            alert(ret.msg);
            return;
        }
        pagination.load(null);
    }, "json");
}

