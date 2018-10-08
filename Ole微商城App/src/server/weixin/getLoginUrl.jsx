//#import Util.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $yunruanInterface:services/YunruanArgService.jsx

;
/**
 * 获取微信联合登录url
 */
(function () {
    var toActOauthUrl = YunruanArgService.getArgValueByKey("oleToActOauthUrl");
    H5CommonUtil.setSuccessResult({toActOauthUrl: toActOauthUrl});
})();