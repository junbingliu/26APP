//#import Util.js
//#import login.js
//#import sysArgument.js
//#import session.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        try {

            LoginService.logoutFrontend();
			/*
            var cookie = new Packages.javax.servlet.http.Cookie(SessionApi.IsoneBaseEngine.sessionService.getSessionCookieName(), null);
            cookie.setPath("/");
            cookie.setMaxAge(0);//默认7天
            response.addCookie(cookie);
			*/
            response.sendRedirect("/login.html");

        } catch (e) {
            $.log(e);
        }
    });
})(dataProcessor);