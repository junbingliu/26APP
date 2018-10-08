var uploadingIdCardPic;
$(document).ready(function () {

    var $body = $("body");
    $body.on('click', "#saveUpdateBtn", function () {
        var idCardId = $("#idCardId").val();
        var idCardFrontPicFileId = $("#idCardFrontPicFileId").val();
        var idCardBackPicFileId = $("#idCardBackPicFileId").val();
        if(idCardId == "" || idCardFrontPicFileId == "" || idCardBackPicFileId == ""){
            layer.alert("参数异常");
            return;
        }

        var postData = {};
        postData.m = merchantId;
        postData.idCardId = idCardId;
        postData.idCardFrontPicFileId = idCardFrontPicFileId;
        postData.idCardBackPicFileId = idCardBackPicFileId;

        $.post("RecordForm_handler.jsx", postData, function (data) {
            layer.alert(data.msg);
        }, "json");

    });

});

function selectIdCardFrontPic() {
    return $("#idCardFrontPic").click();
}

function selectIdCardBackPic() {
    return $("#idCardBackPic").click();
}


function idCardPicOnChane(flag) {
    if (flag == "front") {
        uploadingIdCardPic = layer.load('图片上传中...');
        $("#idCardFrontPic_form").submit();
    } else {
        uploadingIdCardPic = layer.load('图片上传中...');
        $("#idCardBackPic_form").submit();
    }
}

function uploadIdCardPicCallback(data) {
    layer.close(uploadingIdCardPic);
    var jResult = JSON.parse(data);
    var code = jResult.code;
    var msg = jResult.msg;
    var showMsg = "";
    if (code == "0") {
        if (jResult.picType == "front") {
            $("#idCardFrontPicPreviewPath").attr("src", jResult.relPtah);
            $("#idCardFrontPicPreviewFullPath").attr("href", jResult.fullPath);
            $("#idCardFrontPicFileId").val(jResult.fileId);
        } else {
            $("#idCardBackPicPreviewPath").attr("src", jResult.relPtah);
            $("#idCardBackPicPreviewFullPath").attr("href", jResult.fullPath);
            $("#idCardBackPicFileId").val(jResult.fileId);
        }
    } else if (msg.indexOf("File is too large") > -1) {
        showMsg = "文件上传失败，原因是文件超过了50K的限制";
    } else if (msg.indexOf("fileType is not allowed") > -1) {
        showMsg = "文件上传失败，原因是文件格式不正确，文件格式只支持jpg和gif";
    } else {
        showMsg = "文件上传失败，请稍后再试";
    }

    if(showMsg != ""){
        layer.alert(showMsg);
    }
}


