//#import Util.js
//#import $OleInformationAPI:services/InformationService.jsx
//#import @OleInformationAPI:utils/ResponseUtils.jsx
//#import @OleInformationAPI:utils/Preconditions.jsx

/**
 * 设置OLE资讯分类总ID
 */
;(function () {
    try {
        var settingInfo = $.params["data"];
        Preconditions.checkArgument(settingInfo, "保存数据不能为空");
        
        settingInfo = JSON.parse(settingInfo);
        InformationService.saveInformationSetting(settingInfo["infoColumnId"]);
        ResponseUtil.success();
    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();