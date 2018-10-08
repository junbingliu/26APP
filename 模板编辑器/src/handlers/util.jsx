//#import pageService.js
//#import app.js
//#import appEditor.js
function findDataSpec(pageData,dataId){
    //获取原来数据中的dataId
    var all = pageData["_all"];
    var dataSpec = null;
    if(all){
        for(var i=0; i<all.length; i++){
             var dataSpec = all[i];
            if(dataSpec.id == dataId){
                return dataSpec;
            }
        }
    }
    return null;
};

var setPageDataProperty = function (pageData,expr,value){
    var parts = expr.split(/[\.:]/);
    var d = pageData;
    for(var i=0; i<parts.length-1; i++){
        var part = parts[i];
        var c = d[part];
        if(!c){
            c = {};
            d[part] = c;
        };
        d = c;
    };
    var lastPart = parts[parts.length-1];
    d[lastPart] = value;
};

var getPageDataProperty = function (pageData,expr){
    var parts = expr.split(/[\.:]/);
    var d = pageData;
    for(var i=0; i<parts.length-1; i++){
        var part = parts[i];
        var c = d[part];
        if(!c){
            c = {};
            d[part] = c;
        };
        d = c;
    };
    var lastPart = parts[parts.length-1];
    return d[lastPart];
};

var loadPageData = function(m,appId,pageId,loaded){
    if(!loaded){
        loaded = {};
    };
    var pageData = pageService.getMerchantPageData(m, appId, pageId);
    loaded[pageId]  = pageData;
    loadDependentPageData(pageData,m,appId,loaded);
    pageData["_pageId_"] = pageId;
    pageData["_m_"] = m;
    pageData["_appId_"] = appId;
    return pageData;
};

var setPageMetaData = function(m,appId,pageId,dataId,dataValue){
    var pageData = pageService.getMerchantPageData(m, appId, pageId);
    pageData[dataId] = dataValue;
    pageService.setMerchantPageData(m, appId, pageId, pageData);
};

var saveMerchantPageData = function(m,appId,pageId,pageData){
    pageService.setMerchantPageData(m, appId, pageId, pageData);
};



var loadDependentPageData = function(pageData,m,appId,loaded){
    var dependsOn = pageData["_dependsOn"];
    var theall = pageData["_all"];
    if(!theall){
        theall = [];
    };
    if (dependsOn) {
        dependsOn.map(function (p) {
            if(!loaded[p]){
                /*还没有load过的才load,防止循环引用造成死循环*/
                var pdata = loadPageData(m, appId, p,loaded);
                pageData[p] = pdata;
                var child_all = pdata["_all"];
                if(child_all){
                    theall = theall.concat(child_all);
                }
            }
        });
    };
    pageData["_all"] = theall;
};

var setDependsOn = function(m,appId,pageId,dependsOn){
    if(!dependsOn){
        return;
    };
    var pageData = pageService.getMerchantPageData(m, appId, pageId) || {};
    var _dependsOn = pageData["_dependsOn"];
    if(!_dependsOn){
        _dependsOn = [];
        pageData["_dependsOn"] = _dependsOn;
    };
    var dependsOnArray = dependsOn.split(",");
    if(dependsOnArray.forEach){
        dependsOnArray.forEach(function(d){
           if(d){
               if(_dependsOn.indexOf(d)==-1){
                   _dependsOn.push(d);
               };
           };
        });
    }
    else{
        _dependsOn.push(dependsOn);
    }
    pageService.setMerchantPageData(m, appId, pageId, pageData);
};

var setPageData = function(m,appId,pageId,dataId,dataValue,dataSpec){
    var hasPage = dataId.indexOf(":")>-1;
    var realPageId = pageId;
    var realDataId = dataId;
    if(hasPage){
        var parts = dataId.split(":");
        var realPageId = parts[0];
        realDataId = parts[1];
    };
    var realPageData = loadPageData(m,appId,realPageId,false);
    setPageDataProperty(realPageData,realDataId,dataValue);
    pageService.setMerchantPageData(m, appId, realPageId, realPageData);

    var pageData =  pageService.getMerchantPageData(m, appId, pageId);
    if(!pageData){return;};
    var allSpecs=pageData["_all"];
    //找到dataId,否则加入dataSpec
    if(!allSpecs){
        return;
    };
    var found = false;
    allSpecs.forEach(function(spec){
        if(spec.id == dataId){
            found = true;
        };
    });
    if(!found){
        allSpecs.push(dataSpec);
        pageService.setMerchantPageData(m, appId, pageId, pageData);
    };
};

var copyPagesFromTemplate = function(m,appId){
    var meta = AppService.getAppMeta(appId);
    var pages = AppEditorService.getPages(m,appId);
    if(!pages || pages.length==0){
        for(var i=0; i<meta.pages.length; i++){
            var page = meta.pages[i];
            page.pos = i;
            page.appId=appId;
            AppEditorService.savePage(m,appId,page);
            setDependsOn(m,appId,page.pageId,page.dependsOn);
            var initData = page.initData;
            if(initData){
                initData.forEach(function(d){
                    setPageData(m,appId,page.pageId, d.dataId, d.dataValue, d.dataSpec);
                });
            }
        }
    }
};

