//#import Util.js

(function () {

    var merchantId = $.params["m"];

    if(merchantId == "head_merchant"){
        out.print("当前应用只能在商家后台使用");
        return;
    }

    response.sendRedirect("ProductList.jsx?m=" + merchantId);
})();

