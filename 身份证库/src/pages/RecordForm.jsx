//#import doT.min.js
//#import Util.js
//#import user.js
//#import DateUtil.js
//#import UserUtil.js
//#import file.js
//#import $IDCardLib:services/IDCardLibService.jsx


(function () {

    var merchantId = $.params["m"];
    var t = $.params["t"];
    var idCardId = $.params["id"];

    var jRecord = IDCardLibService.getIdCard(idCardId);
    if (!jRecord) {

    }

    var formatCreateTime = "";
    if (jRecord.createTime && jRecord.createTime != "") {
        formatCreateTime = DateUtil.getLongDate(jRecord.createTime);
    }
    jRecord.formatCreateTime = formatCreateTime;

    var createUserName = "";
    var jUser = UserService.getUser(jRecord.createUserId);
    if (jUser) {
        createUserName = UserUtilService.getRealName(jUser);
    }
    jRecord.createUserName = createUserName;

    jRecord.userId = jRecord.userId || "";

    var idCardFrontPic = jRecord.idCardFrontPic;
    var idCardBackPic = jRecord.idCardBackPic;
    if (!idCardFrontPic || idCardFrontPic == "") {
        idCardFrontPic = jRecord.newIdCardFrontPic || "";
    }
    if (!idCardBackPic || idCardBackPic == "") {
        idCardBackPic = jRecord.newIdCardBackPic || "";
    }

    var idCardBackPicFileId = "";
    var idCardBackPicRelPath = "/upload/id-1.jpg";
    var idCardBackPicFullPath = "/upload/id-1.jpg";
    var idCardFrontPicFileId = "";
    var idCardFrontPicRelPath = "/upload/id-1.jpg";
    var idCardFrontPicFullPath = "/upload/id-1.jpg";
    if (idCardFrontPic && idCardFrontPic != "") {
        idCardFrontPicFileId = idCardFrontPic;
        idCardFrontPicFullPath = FileService.getFullPath(idCardFrontPicFileId);
        idCardFrontPicRelPath = FileService.getRelatedUrl(idCardFrontPicFileId, "320X200");
    }
    if (idCardBackPic && idCardBackPic != "") {
        idCardBackPicFileId = idCardBackPic;
        idCardBackPicFullPath = FileService.getFullPath(idCardBackPicFileId);
        idCardBackPicRelPath = FileService.getRelatedUrl(idCardBackPicFileId, "320X200");
    }
    jRecord.idCardFrontPicFileId = idCardFrontPicFileId;
    jRecord.idCardFrontPicRelPath = idCardFrontPicRelPath;
    jRecord.idCardFrontPicFullPath = idCardFrontPicFullPath;

    jRecord.idCardBackPicFileId = idCardBackPicFileId;
    jRecord.idCardBackPicRelPath = idCardBackPicRelPath;
    jRecord.idCardBackPicFullPath = idCardBackPicFullPath;

    var pageData = {
        merchantId: merchantId,
        idCardFrontPicFileId: idCardFrontPicFileId,
        idCardBackPicFileId: idCardBackPicFileId,
        jRecord: jRecord
    };

    var template = $.getProgram(appMd5, "pages/RecordForm.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
