//#import Util.js
//#import login.js
//#import session.js

;(function() {
    var state = "true";
    LoginService.logoutFrontend();
    /*var cookie = new Packages.javax.servlet.http.Cookie(SessionApi.IsoneBaseEngine.sessionService.getSessionCookieName(), null);
    cookie.setPath("/");
    cookie.setMaxAge(0);//默认7天
    response.addCookie(cookie);*/

    response.sendRedirect("/login.html");
})();