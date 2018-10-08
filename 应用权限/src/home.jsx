//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var appUrl = "index.jsx?m=" + m + "#/" + m+"/userGroup/list";
    response.sendRedirect(appUrl);
})();

