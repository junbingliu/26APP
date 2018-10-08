//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import @handlers/util.jsx
(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
    var origPageId = $.params.origPageId;
    var name = $.params.name;
    var url = $.params.url;
    var template = $.params.template;
    var dataProcessor = $.params.dataProcessor;
    var pos = $.params.pos;
    var dependsOn = $.params.dependsOn;
    var initDataString = $.params.initData;
    var initData = null;
    if(initDataString){
        initData = JSON.parse(initDataString);
    }

    try{
        pos = parseInt(pos);
    }
    catch(e){
        pos = 100;
    }

    var rapp = AppService.getApp(rappId);
    var page = {
        pageId:pageId,
        appId:rappId,
        name:name,
        template:template,
        dataProcessor:dataProcessor,
        url:url,
        pos:pos,
        initDataString:initDataString,
        dependsOn: dependsOn,
        merchantId:m
    };



    var template = $.getProgram(appMd5,'pages/copyPageAndData.jsxp');
    try{
        AppEditorService.savePage(m,rappId,page);
        setDependsOn(m,rappId,pageId,dependsOn);
        if(initData){
            initData.forEach(function(d){
                setPageData(m,rappId,page.pageId, d.dataId, d.dataValue, d.dataSpec);
            });
        };

        var origPageData = pageService.getMerchantPageData(m, rappId,origPageId);
        saveMerchantPageData(m,rappId,pageId,origPageData);

        var pageData = {page:page,rappId:rappId,m:m,state:"ok",rapp:rapp,state:"ok",origPageId:origPageId};
    }
    catch(e){
        var pageData = {page:page,rappId:rappId,m:m,state:"err",msg:e,rapp:rapp,state:"err",msg:e};
    }

    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();