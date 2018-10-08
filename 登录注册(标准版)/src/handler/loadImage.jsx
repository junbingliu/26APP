//#import Util.js

;(function() {
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.appmarket,
        Packages.net.xinshi.isone.modules.appmarket.service.impl,
        Packages.net.xinshi.isone.commons,
        Packages.org.json,
        Packages.java.lang,
        Packages.java.io,
        Packages.java.util,
        Packages.java.net
    );

    var isNeedValidate = false;
    var redirectUrl = $.params.rurl;
    if(redirectUrl){
        if(!isNeedValidate){
            response.sendRedirect(redirectUrl);
            return;
        }
        if(/^http:\/\/(img|img1)\.is1\.com\.cn(.*)$/.test(redirectUrl)){
            response.sendRedirect(redirectUrl);
        }
        return;
    }

    var resourceUrl = $.params.url;
    if(resourceUrl){
        var fileId = selfApi.Is1AppMarketEngine.appPages.getResFileId(appMd5, resourceUrl);
        if(fileId){
            var realUrl = selfApi.Is1AppMarketEngine.appPages.getUrlFromFileId(fileId, "");
            if(realUrl){
                response.sendRedirect(realUrl);
                return;
            }
        }
    }
})();