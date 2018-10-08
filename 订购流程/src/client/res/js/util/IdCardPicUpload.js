var uploadingIdCardPic;
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
            orderFormPage.idCardFrontPicPreviewPath(jResult.relPtah);
            orderFormPage.idCardFrontPicPreviewFullPath(jResult.fullPath);
            orderFormPage.idCardFrontPic(jResult.fileId);
        } else {
            orderFormPage.idCardBackPicPreviewPath(jResult.relPtah);
            orderFormPage.idCardBackPicPreviewFullPath(jResult.fullPath);
            orderFormPage.idCardBackPic(jResult.fileId);
        }
    } else if (msg.indexOf("File is too large") > -1) {
        showMsg = "文件上传失败，原因是文件超过了50K的限制";
    } else if (msg.indexOf("fileType is not allowed") > -1) {
        showMsg = "文件上传失败，原因是文件格式不正确，文件格式只支持jpg和gif";
    } else {
        showMsg = msg;
    }

    if(showMsg != ""){
        confirmDialog.show(showMsg, function () {
        });
    }
}