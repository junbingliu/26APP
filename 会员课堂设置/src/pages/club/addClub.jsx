//#import doT.min.js
//#import Util.js

(function () {

    try {
        var template = $.getProgram(appMd5, "pages/club/addClub.jsxp");

        var pageFn = doT.template(template);
        out.print(pageFn());
    }catch (e) {
        out.print("发生了错误: "+e);
    }

})();
