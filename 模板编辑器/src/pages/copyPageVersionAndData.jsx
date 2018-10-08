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
    var pubDate = $.params.pubDate;


    try{
        pos = parseInt(pos);
    }
    catch(e){
        pos = 100;
    }

    var rapp = AppService.getApp(rappId);
    var page = {
        origPageId:origPageId,
        appId:rappId,
        name:name,
        template:template,
        dataProcessor:dataProcessor,
        url:url,
        pos:pos,
        initDataString:initDataString,
        dependsOn: dependsOn,
        publishDate:pubDate,
        merchantId:m
    };



    var template = $.getProgram(appMd5,'pages/copyPageVersionAndData.jsxp');
    var pageVersionId = AppEditorService.addPageVersion(m,rappId,origPageId,page);

    page.pageId = pageVersionId;
    setDependsOn(m,rappId,pageVersionId,dependsOn);


    if(initData){
        initData.forEach(function(d){
            setPageData(m,rappId,pageVersionId, d.dataId, d.dataValue, d.dataSpec);
        });
    };


    var origPageData = pageService.getMerchantPageData(m, rappId,origPageId);
    saveMerchantPageData(m,rappId,pageVersionId,origPageData);

    var pageData = {page:page,rappId:rappId,m:m,state:"ok",rapp:rapp,state:"ok",origPageId:origPageId};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();