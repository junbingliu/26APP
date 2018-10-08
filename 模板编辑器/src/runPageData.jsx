//#import Util.js
//#import app.js
//#import pageService.js
//#import @handlers/dataProcessor.jsx
//#import @handlers/util.jsx

//m, rappId, rpageId, dataProcessorPage,rappMd5,templateId

/*
仅仅获得Data,不需要展示整个网页
 */
(function(){
    var productionMode = $.params.productionMode;
    var pageData = loadPageData(m, rappId, rpageId);
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
    try{
        dataProcessor.pageData["rappId"] = rappId;
        var ret = {
            state:"ok",
            pageData:dataProcessor.pageData,
            appId:rappId,
            pageId:rpageId

        }
        out.print(JSON.stringify(ret));
    }
    catch(e){
        var ret = {
            state:"err",
            appId:rappId,
            pageId:rpageId,
            error:e
        }
        out.print(JSON.stringify(ret));
    }
})();