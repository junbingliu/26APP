//#import Util.js
//#import login.js
//#import productImportOrExport.js

;
(function () {
    try {
        if (!filePath || filePath == "") {
            $.log("BatchUpdateProductMobileDescTask.jsx....数据包文件上传失败或者获取失败");
            return;
        }

        $.log("BatchUpdateProductMobileDescTask.jsx....888888888888888888888888888888数据包文件上传失败或者获取失败");
        var jConfig = {};
        jConfig.isEnableUpdateMobileDescByUpload = true;//是否启用上传图片的方式修改商品手机详情
        jConfig.descTemplate = descTemplate || "";
        jConfig.descImagePath = descImagePath || "";
        jConfig.findImageType = findImageType || "";
        jConfig.imageSize = imageSize || "";
        jConfig.findTypeIndex = findTypeIndex || "";
        jConfig.execWhenNotNull = execWhenNotNull || "";
        jConfig.beginLine = beginLine || "";
        jConfig.endLine = endLine || "";

        ProductImportOrExportService.doBatchUpdateProductDesc(merchantId, userId, jConfig, filePath);
    }
    catch (e) {
        $.log("BatchUpdateProductMobileDescTask.jsx....操作出现异常:" + e);
    }
})();