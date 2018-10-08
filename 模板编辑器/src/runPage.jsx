//#import Util.js
//#import app.js
//#import pageService.js
//#import @handlers/dataProcessor.jsx
//#import @handlers/util.jsx
//#import artTemplate.js
//#import artTemplateHelper.js
//#import doT.min.js
//#import DigestUtil.js

//m, rappId, rpageId, dataProcessorPage,rappMd5,templateId


(function(){
    var isUseMin = function (pageData) {
        var config = pageData.config;
        return config && config.usemin && config.usemin.value && config.usemin.value == "T";
    };
    var productionMode = $.params.productionMode;
    var pageData = loadPageData(m, rappId, rpageId);
    var appLogList=AppService.getAppLog(m,rappId,rpageId);
    if(appLogList&&appLogList.length>0){
        pageData['lastLog']=appLogList[appLogList.length-1];
    }

    dataProcessor.pageData = pageData;
    if(!productionMode||productionMode=="true"){
        //"undefind"或者"true"表示前台
        pageData.productionMode = true;
    }else{
        pageData.productionMode = false;
    }

    if(dataProcessorPage){
        $.run(rappId, rappMd5, dataProcessorPage, dataProcessorPage);
    }
    dataProcessor.run();
    var source = $.getProgram(rappMd5,templateId);
    var meta = AppService.getAppMeta(rappId);
    if(meta&&meta.renderEngine=="artTemplate"){
        if(isUseMin(pageData)){
            template.config("compress", true);
        }
        if(dataProcessor.pageData.artTemplateHelpers){
            for(var k in dataProcessor.pageData.artTemplateHelpers){
                var func = dataProcessor.pageData.artTemplateHelpers[k];
                template.helper(k,func);
            }
        }
        var render = template.compile(source);

    }else{
        var render= doT.template(source);
    }
    try{
        //用模板和PageData MD5后做为key，如果下次访问，这个数据（模板和pageData）没有发生成变化，则取上次渲染好的数据
        //$.log("\n.......................88888888888888............dataProcessor.pageData="+dataProcessor.pageData);
        //$.log("\n.......................88888888888888............source="+JSON.stringify(dataProcessor));
        //$.log("\n.......................88888888888888............md5="+DigestUtil.md5(source + JSON.stringify(dataProcessor.pageData)));
        var key = "appEditor_pageData_"+DigestUtil.md5(source + JSON.stringify(dataProcessor.pageData));
        var content = ps20.getContent(key);
        if(content && content != "null"){
            out.print(content);
            return;
        }

        dataProcessor.pageData["rappId"] = rappId;
        var html = render(dataProcessor.pageData);
        //将渲染好的html数据保存到数据库
        ps20.saveContent(key,html);
        out.print(html);
    }
    catch(e){
        out.print("配置数据有误：" + e);
        out.print(JSON.stringify(dataProcessor.pageData));
    }
})();