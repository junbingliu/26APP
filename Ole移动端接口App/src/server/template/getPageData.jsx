//#import Util.js
//#import pageService.js
//#import app.js
//#import Info.js
//#import appEditor.js
//#import DateUtil.js
//#import file.js
//#import @server/template/dataProcessor.jsx
//#import @server/template/util.jsx
//#import @server/util/ErrorCode.jsx
//#import $articleCommentLike:services/commentLikeService.jsx
//#import $OleInformationAPI:services/InformationService.jsx
//#import $goodProductManage2:services/goodProductServices.jsx
//#import $tryOutManage:services/tryOutManageServices.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var m = $.params.m;
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
    var dataId = $.params.dataId;
    var excludeId = $.params.excludeId;//输出不包含该id的数据
    var start = $.params.start;
    var end = $.params.end;
    var pages = $.params.pages || 1;
    var limit = $.params.limit || 7;
    var begin = (pages - 1) * limit;
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
    pageData.productionMode = false;
    dataProcessor.run();

    var pageData1 = dataProcessor.pageData;

    var floors = [];
    if (rappId == 'oleMarketTemplate' && pageId == 'goodProduct') {
        if (pageData1.oleFloors_g) {
            var oleFloors_g = pageData1.oleFloors_g;
            var floorCount = pageData1.config && pageData1.config.floorCount && pageData1.config.floorCount.value;
            var pageCount = (pages * limit) + 1;
            if (floorCount) {
                floorCount = Number(floorCount) + 1;
            }
            if (floorCount && pageCount > floorCount) {
                pageCount = Number(floorCount);
            }
            for (var r = begin + 1; r < pageCount; r++) {
                if (oleFloors_g[r]) {
                    var obj = {
                        index: 0,
                        imgUrl: "",
                        time: "",
                        imgLinkTo: "",
                        para: "",
                        discount: ""
                    };
                    obj.index = r;

                    if (oleFloors_g[r].discount) {
                        obj.discount = oleFloors_g[r].discount.content;
                    }
                    obj.imgLinkTo = oleFloors_g[r].imgLinkTo;
                    var pid = "goodProductManage2_" + obj.imgLinkTo;
                    var goodProduct = goodProductServices.getById(pid);
                    if (goodProduct) {
                        var beginTime = goodProduct.beginTime + ":00";
                        var endTime = goodProduct.endTime + ":00";
                        beginTime = DateUtil.getLongTime(beginTime, "yyyy-MM-dd HH:mm:ss");
                        endTime = DateUtil.getLongTime(endTime, "yyyy-MM-dd HH:mm:ss");
                        beginTime = DateUtil.getStringDate(beginTime, "MM月dd日");
                        endTime = DateUtil.getStringDate(endTime, "MM月dd日");
                        obj.time = "时间：" + beginTime + "-" + endTime;
                        obj.para = goodProduct.title;
                        obj.imgUrl = oleFloors_g[r].imgUrl;
                        floors.push(obj);
                    }
                }
            }
        }
        ret.data = floors;
    }

    if (rappId == 'oleMarketTemplate' && pageId == 'tryOut3') {
        if (pageData1.oleFirstList) {
            var oleFirstList = pageData1.oleFirstList;
            var floor1 = {
                oleFloors_h: "",
                oleFloors_i: []
            };
            for (var v = 0; v < oleFirstList.length; v++) {
                oleFirstList[v].parh = "";
                oleFirstList[v].parp = "";
                if (pageData1.parht[v] && pageData1.parht[v].content) {
                    oleFirstList[v].parh = pageData1.parht[v].content;
                }
                if (pageData1.parpt[v] && pageData1.parpt[v].content) {
                    oleFirstList[v].parp = pageData1.parpt[v].content;
                }
                // $.log(JSON.stringify(oleFirstList[v]));
                floor1.oleFloors_i.push(oleFirstList[v])
            }
            floors.push(floor1);
            $.log(JSON.stringify(floors) + "sssssssssssssss");
        }
        if (pageData1.oleFloors_h) {
            var floorCountTry = pageData1.config && pageData1.config.floorCount && pageData1.config.floorCount.value;
            var endNum = pages * limit;
            if(floorCountTry < endNum){
                endNum = floorCountTry;
            }
            for (var u = begin; u < endNum; u++) {
                if (!pageData1.oleFloors_h[u]) {
                    break;
                }
                var floor = {
                    oleFloors_h: "",
                    oleFloors_i: []
                };
                if (pageData1.oleFloors_h[u]) {
                    floor.oleFloors_h = pageData1.oleFloors_h[u].content;
                    if (pageData1.oleFloors_i) {
                        var array = [];
                        if (!pageData1.oleFloors_i[u]) {
                            break
                        }
                        for (var w = 0; w < pageData1.oleFloors_i[u].length; w++) {
                            var okm = {
                                id: "",
                                fileId: "",
                                imgUrl: "",
                                selected: false,
                                linkTo: "",
                                description: "",
                                openInNewPage: "",
                                parh: "",
                                parp: ""
                            };
                            okm.id = pageData1.oleFloors_i[u][w].id;
                            okm.fileId = pageData1.oleFloors_i[u][w].fileId;
                            okm.imgUrl = pageData1.oleFloors_i[u][w].imgUrl;
                            okm.selected = pageData1.oleFloors_i[u][w].selected;
                            okm.linkTo = pageData1.oleFloors_i[u][w].linkTo;
                            okm.description = pageData1.oleFloors_i[u][w].description;
                            okm.openInNewPage = pageData1.oleFloors_i[u][w].openInNewPage;
                            okm.parp = "";
                            okm.parh = "";
                            if (pageData1.parh && pageData1.parh[u] && pageData1.parh[u][w] && pageData1.parh[u][w].content) {
                                okm.parh = pageData1.parh[u][w].content;
                            }
                            if (pageData1.parp && pageData1.parp[u] && pageData1.parp[u][w] && pageData1.parp[u][w].content) {
                                okm.parp = pageData1.parp[u][w].content;
                            }
                            array.push(okm);
                        }
                        floor.oleFloors_i = array;
                    }
                    floors.push(floor);
                }
            }

        }
        ret.data = floors;
    }


    if (rappId == 'oleMarketTemplate' && pageId == 'sort') {
        if (pageData1.sort_i) {
            for (var r = 0; r < pageData1.floorCount; r++) {
                var flo = {
                    sort_i: {},
                    sort_t: "",
                    sort_list: []
                };
                if (pageData1.sort_i[r]) {
                    flo.sort_i = pageData1.sort_i[r];
                    flo.sort_list = pageData1.sort_list[r];
                    flo.sort_t = pageData1.sort_t[r].content;
                    floors.push(flo);
                }
            }
        }
        ret.data = floors;
    }

    if (rappId == 'oleMarketTemplate' && pageId == 'hotSearch') {
        if (pageData1.hotSearch) {
            var json = {};
            for (var n = 0; n < pageData1.hotSearch.length; n++) {
                if (json[pageData1.hotSearch[n].content] == undefined) {
                    floors.push(pageData1.hotSearch[n].content);
                    json[pageData1.hotSearch[n].content] = pageData1.hotSearch[n].content;
                }
            }
        }
        ret.data = {
            hotWord: floors
        };
    }


    if (rappId == 'oleMarketTemplate' && pageId == 'oleHome') {
        var rotationList = [];
        var allList = {
            tryOutHeadImg: {},
            rotationList: rotationList,
            articleList: [],
            goodProductList: [],
            tryOutProduct: [],
            tryOutList: []
        };
        if (pageData1.rotationList && pageData1.rotationList.length > 0) {
            rotationList = pageData1.rotationList;
            for (var f = 0; f < rotationList.length; f++) {
                if (rotationList[f].description == "trialReport") {
                    var array1 = rotationList[f].linkTo.split("|");
                    rotationList[f].linkTo = "tryOutManage_" + array1[0] + array1[1];
                }
            }
        }

        var articleList = [];
        if (pageData1.articleImg_b && pageData1.articleImg_b != {}) {
            var articleImg_b = pageData1.articleImg_b;
            var articleLogo = pageData1.articleLogo_b;
            for (var q = 0; q < pageData1.articleFloorCount; q++) {
                if (articleImg_b[q]) {
                    var articleObj = {};
                    articleObj.imgLinkTo = articleImg_b[q].imgLinkTo;
                    articleObj.articleLogo = "";
                    if (articleLogo && articleLogo[q]) {
                        articleObj.articleLogo = articleLogo[q].imgUrl;
                    }
                    var aclid = "acl_management2_collection_" + articleObj.imgLinkTo;
                    var acl = commentLikeService.getById(aclid);
                    articleObj.collections = 0;
                    articleObj.browse = 0;
                    if (acl) {
                        articleObj.likes = acl.collections;
                    }
                    articleObj.browse = InformationService.getBrowseCountById(articleImg_b[q].imgLinkTo);

                    var info = InfoService.getInfo(articleObj.imgLinkTo);

                    if (info) {
                        articleObj.title = info.title;
                        articleObj.descriptions = info.preface || "";
                        articleObj.imageUrl = FileService.getFullPath(info.bannerImageFileId);
                    }
                    articleList.push(articleObj);
                }
            }
        }

        var goodProductList = [];
        if (pageData1.goodProductImg_v && pageData1.goodProductImg_v != {}) {
            for (var r = 0; r < pageData1.goodProductFloorCount; r++) {
                var goodProductImg_v = pageData1.goodProductImg_v;
                var goodProductObj = {};
                if (goodProductImg_v[r]) {
                    goodProductObj.imgLinkTo = goodProductImg_v[r].imgLinkTo;
                    var pid1 = "goodProductManage2_" + goodProductImg_v[r].imgLinkTo;
                    var goodProduct1 = goodProductServices.getById(pid1);
                    goodProductObj.time = "";
                    goodProductObj.para = "";
                    if (goodProduct1) {
                        var beginTime1 = goodProduct1.beginTime + ":00";
                        var endTime1 = goodProduct1.endTime + ":00";
                        beginTime1 = DateUtil.getLongTime(beginTime1, "yyyy-MM-dd HH:mm:ss");
                        endTime1 = DateUtil.getLongTime(endTime1, "yyyy-MM-dd HH:mm:ss");
                        beginTime1 = DateUtil.getStringDate(beginTime1, "MM月dd日");
                        endTime1 = DateUtil.getStringDate(endTime1, "MM月dd日");
                        goodProductObj.time = "时间：" + beginTime1 + "-" + endTime1;
                        goodProductObj.para = goodProduct1.title;
                        goodProductObj.imgUrl = goodProduct1.imgUrl;
                        if (goodProduct1.headImageFileId) {
                            goodProductObj.imgUrl = FileService.getRelatedUrl(goodProduct1.headImageFileId, "750X420");
                        }
                    }
                    if (pageData1.goodProductParaZhe_v && pageData1.goodProductParaZhe_v[r]) {
                        goodProductObj.discount = pageData1.goodProductParaZhe_v[r].content;
                    }
                    goodProductList.push(goodProductObj);
                }
            }
        }

        var moreList = [];
        if (pageData1.moreArticle && pageData1.moreArticle.content) {
            moreList.push(pageData1.moreArticle.content);
        } else {
            moreList.push("查看更多专题");
        }
        if (pageData1.moreGood && pageData1.moreGood.content) {
            moreList.push(pageData1.moreGood.content);
        } else {
            moreList.push("查看更多好物");
        }
        if (pageData1.moreTry && pageData1.moreTry.content) {
            moreList.push(pageData1.moreTry.content);
        } else {
            moreList.push("查看更多试用");
        }

        var tryOutHeadImg = {};
        if (pageData1.tryOutHeadImg && pageData1.tryOutHeadImg != {}) {
            tryOutHeadImg.imgUrl = pageData1.tryOutHeadImg.imgUrl;
            tryOutHeadImg.imgLinkTo = pageData1.tryOutHeadImg.imgLinkTo;
        }
        var tryOutProduct = [];
        if (pageData1.tryOutProduct && pageData1.tryOutProduct.length > 0) {
            tryOutProduct = pageData1.tryOutProduct;
            for (var b = 0; b < tryOutProduct.length; b++) {
                tryOutProduct[b].productObjId = "tryOutManage_" + tryOutProduct[b].description + tryOutProduct[b].linkTo;
            }
        }
        var tryOutList = [];
        if (pageData1.tryOutList && pageData1.tryOutList.length > 0) {
            for (var e = 0; e < pageData1.tryOutList.length; e++) {
                var tryOutObj = {};
                tryOutObj.imgUrl = pageData1.tryOutList[e].imgUrl;
                tryOutObj.imgLinkTo = pageData1.tryOutList[e].linkTo;
                tryOutObj.parh = "";
                tryOutObj.parp = "";
                if (pageData1.tryOutParaH_f && pageData1.tryOutParaH_f[e] && pageData1.tryOutParaH_f[e].content) {
                    tryOutObj.parh = pageData1.tryOutParaH_f[e].content;
                }
                if (pageData1.tryOutParaH_f && pageData1.tryOutParaP_f[e] && pageData1.tryOutParaP_f[e].content) {
                    tryOutObj.parp = pageData1.tryOutParaP_f[e].content;
                }
                tryOutList.push(tryOutObj);
            }
        }
        allList.rotationList = rotationList;
        allList.articleList = articleList;
        allList.goodProductList = goodProductList;
        allList.tryOutHeadImg = tryOutHeadImg;
        allList.tryOutProduct = tryOutProduct;
        allList.tryOutList = tryOutList;
        allList.moreList = moreList;
        function getBoolean(value) {
            if (value == "true") {
                value = true;
            } else {
                value = false;
            }
            return value;
        }

        allList.isShowGoodProduct = getBoolean(pageData1.isShowGoodProduct);
        allList.isShowArticle = getBoolean(pageData1.isShowArticle);
        allList.isShowTryOut = getBoolean(pageData1.isShowTryOut);
        ret.data = allList;
    }

    out.print(JSON.stringify(ret));
})();
