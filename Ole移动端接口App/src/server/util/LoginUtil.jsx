var LoginUtil = {
    //loginId可以是手机号或会员内部id
    getLoginToken: function (loginId) {
        if (!loginId) {
            return "";
        }
        var tokenKey = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "loginTokenKey");
        var lastLoginTime = new Date().getTime();
        var key = loginId + "|" + lastLoginTime;
        return Md5Service.encString(key, tokenKey) + "";
    }
};