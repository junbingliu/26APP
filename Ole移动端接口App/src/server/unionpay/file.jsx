//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import $accountFileManage:services/UnionPayService.jsx

/**
 * 银联定期推送对账文件接口
 * by fuxiao9
 * email: fuxiao9@crv.com.cn
 * date: 2017-11-20
 */
;(function(){
    try {
        var url = $.params.download || ""; // 获取推送地址
        Preconditions.checkArgument(url, "URL is null");
        UnionpayService.addObject({
            "downloadUrl": url
        });
    } catch (e) {
        ResponseUtil.error(e);
        return;
    }
    ResponseUtil.success()
})();