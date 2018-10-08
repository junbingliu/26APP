//#import Util.js
//#import session.js
//#import sysArgument.js

;(function() {
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.appmarket,
        Packages.net.xinshi.isone.modules.appmarket.service.impl,
        Packages.net.xinshi.isone.commons,
        Packages.org.apache.commons.httpclient.HttpClient,
        Packages.net.xinshi.isone.commons.UTF8PostMethod,
        Packages.sun.misc,
        Packages.java.awt.image,
        Packages.javax.imageio,
        Packages.org.json,
        Packages.java.lang,
        Packages.java.net,
        Packages.java.io,
        Packages.java.util.ArrayList,
        Packages.javax.servlet
    );

    var resourceUrl = $.params.url;
    if(resourceUrl){
        var fileId = selfApi.Is1AppMarketEngine.appPages.getResFileId(appMd5, resourceUrl);
        if(fileId){
            var realUrl = selfApi.Is1AppMarketEngine.appPages.getUrlFromFileId(fileId, "");
            if(realUrl){

                var contentType = "";
                if(resourceUrl.indexOf(".css") > -1){
                    contentType = "text/css";
                }else if(resourceUrl.indexOf(".js") > -1){
                    contentType = "text/javascript";
                }else if(resourceUrl.indexOf(".jpg") > -1){
                    contentType = "image/jpeg";
                }else if(resourceUrl.indexOf(".jpeg") > -1){
                    contentType = "image/jpeg";
                }else if(resourceUrl.indexOf(".gif") > -1){
                    contentType = "image/gif";
                }else if(resourceUrl.indexOf(".png") > -1){
                    contentType = "image/png";
                }else if(resourceUrl.indexOf(".bmp") > -1){
                    contentType = "image/bmp";
                }else if(resourceUrl.indexOf(".htc") > -1){
                    contentType = "text/x-component";
                }

                if(contentType != ""){
                    response.setContentType(contentType);
                }

                var resourceUrl = new selfApi.String(realUrl);
                if(resourceUrl.startsWith("/")){
                    var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl");
                    resourceUrl = webUrl + resourceUrl;
                }

                var url = new selfApi.URL(resourceUrl);
                var conn = url.openConnection();
                conn.connect();
                var isr = new selfApi.InputStreamReader(conn.getInputStream(),"utf-8");
                var br = new selfApi.BufferedReader(isr);
                if(contentType == "text/css"){
                    var baos = new selfApi.ByteArrayOutputStream();
                    var tempbyte;
                    while ((tempbyte = br.read()) != -1) {
                        baos.write(tempbyte);
                    }
                    var content = new selfApi.String(baos.toByteArray(),"utf-8");
                    //content = content.replaceAll('url\\("(.*)"\\)',"url(loadImage.jsx?rurl=$1)");
                    content = content.replaceAll('url\\((")?([0-9a-zA-Z\\:\\/\\.]+)(")?\\)','url(loadImage.jsx?rurl=$2)');
                    baos.close();
                    out.write(content);
                }else if(contentType == "text/javascript"){
                    var tempbyte;
                    while ((tempbyte = br.read()) != -1) {
                        out.write(tempbyte);
                    }
                }
                br.close();
                isr.close();
                conn.disconnect();
                return;
            }

        }
    }
//    out.print("");
})();