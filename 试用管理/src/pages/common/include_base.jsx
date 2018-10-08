//#import artTemplate.js
//#import pigeon.js
//#import Util.js

(function(){
    var source = $.getProgram(appMd5, "pages/common/include_base.jsxp");
    var pageData = {};
    var render = template.compile(source);

    out.print(render(pageData));
})();