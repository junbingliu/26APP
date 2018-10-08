//#import Util.js
//#import $appConfig:services/AppConfigLogService.jsx
//#import doT.min.js

(function(){
    var id = $.params.id;
    if(!id){
        out.print("参数为空");
        return;
    }
    var record = AppConfigLogService.getById(id);
    var pageData = {
        data:JSON.stringify(record)
    };

    var template = $.getProgram(appMd5, "pages/showData.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();