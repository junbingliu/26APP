//#import pigeon.js
//#import Util.js
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import $OleInformationAPI:services/InformationService.jsx

/**
 * 删除
 */
;(function () {
    try {
        InformationService.delete($.params.id);
        ResponseUtil.success();
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();
