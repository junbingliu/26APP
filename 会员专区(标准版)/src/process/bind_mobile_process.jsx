//#import Util.js
//#import product.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import sysArgument.js
//#import column.js
//#import @jsLib/GenToken.jsx

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var selfApi = new JavaImporter(
            Packages.org.json,
            Packages.net.xinshi.isone.modules,
            Packages.net.xinshi.isone.commons,
            Packages.net.xinshi.isone.functions.member,
            Packages.java.util,
            Packages.java.net,
            Packages.java.util.regex,
            Packages.net.xinshi.isone.functions.product
        );

        var requestURI = request.getRequestURI() + "";
        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            response.sendRedirect("/login.html?rurl="+requestURI);
        }

        var mid = "head_merchant";
        var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");

        setPageDataProperty(pageData, "requestURI", requestURI + "");
        setPageDataProperty(pageData, "webName", webName);
        setPageDataProperty(pageData, "user", user);

        var token = GenToken.get("bindMobileToken");
        setPageDataProperty(pageData, "token", token);

    });
})(dataProcessor);