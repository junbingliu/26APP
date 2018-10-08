//#import Util.js
//#import login.js
//#import sysArgument.js
(function(processor){
    var requestURI = request.getRequestURI() + "",normalWebSite = "",sslWebSite = "",isHttps = false;
    if((requestURI == "/login.html" || requestURI == "/register.html")){
        normalWebSite = $.getWebSite("");
        sslWebSite = $.getWebSite("ssl");
        isHttps = true;
    }

    processor.on("all",function(pageData,dataIds,elems){

        var includeCommonCss = false;
        if(requestURI == "/appEditor/handlers/getPageData.jsx"){
            includeCommonCss = true;
        }

        var pageType = $.params.ptype;
        if(!pageType){
            pageType = "general";
        }
        setPageDataProperty(pageData,"footerIncludeCommonCss",includeCommonCss);
        setPageDataProperty(pageData,"pageType", pageType);//general,login,shopping


        if(requestURI == "/appEditor/handlers/getTemplate.jsx" || requestURI == "/appEditor/handlers/getPageData.jsx"){
            setPageDataProperty(pageData,"productionMode", false);
        }

        var webUrl = "";
        if(isHttps){
            webUrl = sslWebSite;
        }else{
            webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl");
        }
        setPageDataProperty(pageData,"webUrl", webUrl);

    });

    processor.on(":textLinkList",function(pageData,dataIds,elems){
        if(!isHttps){
            return;
        }
        for (var i = 0, iLength = elems.length; i < iLength; i++) {
            var elem = elems[i];
            if (elem) {
                for (var j = 0, jLength = elem.length; j < jLength; j++) {
                    var linkTo = elem[j].linkTo;
                    if(linkTo && linkTo != ""){
                        if(linkTo.indexOf("http://") == -1){
                            elem[j].linkTo = normalWebSite + (linkTo.substring(0,1) == "/" ? "" : "/") + linkTo;
                        }
                    }
                }
            }
        }
    });



})(dataProcessor);