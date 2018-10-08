//#import doT.min.js
//#import Util.js

(function () {

    try {

        var data = {};
        data.merchantId = $.params.m
        var template = $.getProgram(appMd5, "pages/store/addStore.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(data));
    }catch (e) {
        out.print("发生了错误: "+e);
    }

})();
