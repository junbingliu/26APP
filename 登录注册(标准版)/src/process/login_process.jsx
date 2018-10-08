//#import Util.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        try {

            var ltype = $.params.ltype;
            if (ltype && ltype == "logout") {
                response.sendRedirect("/logout.html");
            }

            var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");

            //现在已登录状态下如果访问login.html页面,不用跳转到会员中心
            var user = LoginService.getFrontendUser();
            if (user) {
                //response.sendRedirect(webUrl + "/ucenter/index.html");
                //return;
            }

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid, "col_sysargument", "webName_cn");
            var normalWebSite = $.getWebSite("");
//            var sslWebSite = $.getWebSite("ssl");

            var returnUrl = $.params.rurl || "";
            if (!returnUrl || returnUrl == "") {
                returnUrl = request.getHeader("referer") + "";
                if (returnUrl && (returnUrl == "null" || returnUrl == request.getRequestURI() + "")) {
                    returnUrl = "";
                }
                if (returnUrl) {
                    if ((webUrl && (returnUrl.indexOf("http://") > -1 || returnUrl.indexOf("https://") > -1) && returnUrl.indexOf(webUrl) == -1)) {
                        returnUrl = "";
                    }
                }
            }
            if (returnUrl) {
                returnUrl = Packages.java.net.URLDecoder.decode(returnUrl, "UTF-8") + "";
            }

            var selfApi = new JavaImporter(
                Packages.net.xinshi.isone.modules,
                Packages.net.xinshi.isone.modules.sysargument,
                Packages.net.xinshi.isone.commons,
                Packages.org.json,
                Packages.java.lang,
                Packages.java.io,
                Packages.java.util,
                Packages.java.net
            );

            if (true) {
                var jArgument = selfApi.IsoneModulesEngine.sysArgumentService.getSysArgument(selfApi.Global.HEAD_MERCHANT, "col_sysargument_loginservice");
                var jArgumentValues = selfApi.SysArgumentUtil.getValues(jArgument);
                var loginShowType = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "loginShowType");
                var is1AppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "is1AppEnable");
                var qqAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "qqAppEnable");
                var taobaoAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "taobaoAppEnable");
                var sinaAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "sinaAppEnable");

                var renrenAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "renrenAppEnable");
                var doubanAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "doubanAppEnable");
                var tqqAppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "tqqAppEnable");
                var t163AppEnable = selfApi.SysArgumentUtil.getSysArgumentStringValue(jArgumentValues, "t163AppEnable");

                setPageDataProperty(pageData, "loginShowType", loginShowType + "");
                setPageDataProperty(pageData, "is1AppEnable", is1AppEnable + "");
                setPageDataProperty(pageData, "qqAppEnable", qqAppEnable + "");
                setPageDataProperty(pageData, "taobaoAppEnable", taobaoAppEnable + "");
                setPageDataProperty(pageData, "sinaAppEnable", sinaAppEnable + "");

                setPageDataProperty(pageData, "renrenAppEnable", renrenAppEnable + "");
                setPageDataProperty(pageData, "doubanAppEnable", doubanAppEnable + "");
                setPageDataProperty(pageData, "tqqAppEnable", tqqAppEnable + "");
                setPageDataProperty(pageData, "t163AppEnable", t163AppEnable + "");


                var domain = request.getParameter("domain");
                if (domain != null) {
                    setPageDataProperty(pageData, "domain", domain + "");
                }
            }


            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "normalWebSite", normalWebSite);
//            setPageDataProperty(pageData,"sslWebSite",sslWebSite);
            setPageDataProperty(pageData, "returnUrl", returnUrl);

            var token = GenToken.get("loginToken");
            setPageDataProperty(pageData, "token", token);

        } catch (e) {
            $.log(e);
        }
    });
})(dataProcessor);