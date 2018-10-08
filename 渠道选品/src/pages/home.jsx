(function () {
//#import Util.js

    var merchantId = $.params["m"];

    if(merchantId == "head_merchant"){
        //out.print("当前应用只能在商家后台使用");
        //return;
    }

    response.sendRedirect("product_list.jsx?m=" + merchantId);
})();

