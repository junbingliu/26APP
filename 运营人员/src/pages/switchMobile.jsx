//#import Util.js
//#import session.js


var m = $.params.m;
SessionService.addSessionValue("_actingMerId",m,request,response);
response.sendRedirect("/xyfs/index_cordova.htmln");