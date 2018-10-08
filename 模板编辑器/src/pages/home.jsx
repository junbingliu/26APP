//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if(!m){
        m="m_100";
    }
    var appUrl = "listTemplates.jsx?m=" + m ;
    response.sendRedirect(appUrl);
})();

