//#import Util.js
//#import pageService.js
//#import app.js
//#import appEditor.js
//#import @handlers/dataProcessor.jsx
//#import @handlers/util.jsx
;

(function () {
    var m = $.params.m;
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
    var dataId = $.params.dataId;
    var excludeId = $.params.excludeId;//输出不包含该id的数据
    var start = $.params.start;
    var end = $.params.end;
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var pageData = loadPageData(m, rappId, pageId);
    dataProcessor.pageData = pageData;
    if (dataId) {
        var dataSpec = findDataSpec(pageData, dataId);
        var data = getPageDataProperty(pageData, dataId);
        var count = 0;
        if (data instanceof Array && start && end) {
            count = data.length;
            data = data.slice(start, end);

        }
        var newPageData = {"_all": []};
        newPageData["_all"].push(dataSpec);
        setPageDataProperty(newPageData, dataId, data);
        setPageDataProperty(newPageData, dataId + "Count", count);
        dataProcessor.pageData = newPageData;
    }
    if (excludeId) {
        var ids = excludeId.split(",");
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (pageData[id]) {
                pageData[id] = {};
            }
        }

    }

    var page = AppEditorService.getPageById(m, rappId, pageId);
    if (page && page.dataProcessor) {
        var rapp = AppService.getApp(rappId);
        $.run(rappId, rapp.md5, page.dataProcessor, page.dataProcessor);
    }
    ;
    pageData.productionMode = false;
    dataProcessor.run();
    var ret = {
        state: "ok",
        pageData: dataProcessor.pageData
    };
    if (rappId == 'ewjAppTemplate' && pageId == 'categoryPage' && dataId == 'header:cat_nav' && m == 'head_merchant') {
        var categoryLevel = $.params.categoryLevel;
        var header = ret.pageData && ret.pageData.header;
        var cat_nav = header && header.cat_nav;
        if (cat_nav && cat_nav.children && categoryLevel != 3) {
            for (var i = 0; i < cat_nav.children.length; i++) {
                var child1 = cat_nav.children[i];
                var children2 = child1.children;
                if (categoryLevel == 1) {
                    child1.children = [];
                    continue;
                }
                if (children2) {
                    for (var o = 0; o < children2.length; o++) {
                        var child2 = children2[o];
                        if (categoryLevel == 2 || !categoryLevel) {
                            child2.children = [];
                        }
                    }
                }
            }
        }
    }
    out.print(JSON.stringify(ret));
})();
