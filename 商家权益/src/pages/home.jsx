//#import Util.js
var m = $.params['m'];
if(!m){
    m="head_merchant";
}
response.sendRedirect("../home.jsx?m=" + m);