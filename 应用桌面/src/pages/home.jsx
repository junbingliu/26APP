//#import Util.js
var m = $.params['m'];
if(!m){
    m=$.getDefaultMerchantId();
}
response.sendRedirect("../home.jsx?m=" + m);