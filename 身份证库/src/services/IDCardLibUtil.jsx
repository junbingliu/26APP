//#import file.js
//#import $IDCardLib:services/IDCardLibService.jsx

var IDCardLibUtil = (function () {

    var f = {
        isExist: function (name, idCard) {
            var jIdCard = IDCardLibService.getIdCardByName(name, idCard);
            if (jIdCard) {
                return true;
            }
            return false;
        },
        addIdCard: function (name, idCard, idCardFrontPic, idCardBackPic, userId) {
            var result = {};
            try {
                var jIdCard = IDCardLibService.getIdCardByName(name, idCard);
                if (jIdCard) {
                    result.code = "101";
                    result.msg = "身份证信息已经存在";
                    return result;
                }

                var jRecord = {};
                jRecord.name = name;
                jRecord.idCard = idCard;
                jRecord.newIdCardFrontPic = idCardFrontPic;
                jRecord.newIdCardBackPic = idCardBackPic;
                jRecord.userId = userId;
                var newId = IDCardLibService.addIdCard(jRecord, "u_sys");

                result.code = "0";
                result.id = newId;
                result.msg = "操作成功";
                return result;
            } catch (e) {
                result.code = "110";
                result.msg = "操作出现异常，异常信息为：" + e;
                return result;
            }
        },
        getIdCardPic: function (name, idCard, spex) {
            var result = {};
            result.idCardFrontPic = "";
            result.idCardBackPic = "";
            try {
                var jIdCard = IDCardLibService.getIdCardByName(name, idCard);
                if (!jIdCard) {
                    return result;
                }
                //result.idCardFrontPic = jIdCard.newIdCardFrontPic || "";
                //result.idCardBackPic = jIdCard.newIdCardBackPic || "";

                if (jIdCard.idCardFrontPic && jIdCard.idCardFrontPic != "") {
                    result.idCardFrontPic = jIdCard.idCardFrontPic;
                }
                if (jIdCard.idCardBackPic && jIdCard.idCardBackPic != "") {
                    result.idCardBackPic = jIdCard.idCardBackPic;
                }
                if (result.idCardFrontPic != "") {
                    result.idCardFrontPicPreviewPath = FileService.getRelatedUrl(result.idCardFrontPic, spex);
                    result.idCardFrontPicPreviewFullPath = FileService.getFullPath(result.idCardFrontPic);
                }
                if (result.idCardBackPic != "") {
                    result.idCardBackPicPreviewPath = FileService.getRelatedUrl(result.idCardBackPic, spex);
                    result.idCardBackPicPreviewFullPath = FileService.getFullPath(result.idCardBackPic);
                }

                return result;
            } catch (e) {
                $.log("\n............................................IDCardLibUtil.jsx....error="+e);
                return result;
            }
        }
    };
    return f;
})();